/**
 * Shared walker for the content review round trip.
 *
 * Reads content/intake.ts and content/exercises.ts with the TypeScript compiler, and returns
 * every reviewable text with a stable id, its lane(s), its current text, whether Eric has
 * reviewed it, and the source positions the importer needs to rewrite it in place.
 *
 * Ids (stable across runs; never renumber):
 *   truth:<concern>.<situation>      REFLECT[...].truth
 *   truth:area.<concern>             AREA_REFLECT[...].truth (one line, phrased per body area)
 *   try:<concern>:name | :step:<n> | :note   TRY_TODAY[...] fields (one flag for the group)
 *   week:<n>                         WEEK_NOTES[n-1]
 *   question:<lane>:<n>              QUESTIONS[lane][n-1]
 *   exercise:<id>                    exercises[].name (flag is `approved`; other fields are edited in exercises.ts)
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import ts from "typescript";
import { CONCERNS } from "../content/intake";

export interface Span {
  start: number;
  end: number;
}

export interface Flag {
  /** "arg": a truth("…") call; insert/replace the second argument. "prop": a `reviewedByEric:`/`approved:` literal. */
  kind: "arg" | "prop";
  /** For "arg": position just before the closing paren, and the existing argument span if any. For "prop": the literal span. */
  insertAt?: number;
  span?: Span;
}

export interface ReviewItem {
  id: string;
  /** Group id: rows that share one reviewed flag (try-today fields). Equals id for single-field items. */
  group: string;
  lane: string;
  type: "truth" | "try today" | "week note" | "question" | "exercise";
  text: string;
  reviewed: boolean;
  file: string;
  textSpan: Span;
  flag: Flag;
}

export const FILES = {
  intake: path.join(process.cwd(), "content", "intake.ts"),
  exercises: path.join(process.cwd(), "content", "exercises.ts"),
};

function parse(file: string) {
  const text = readFileSync(file, "utf8");
  return { text, sf: ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true) };
}

function topLevel(sf: ts.SourceFile, name: string): ts.Expression {
  for (const st of sf.statements) {
    if (ts.isVariableStatement(st)) {
      for (const d of st.declarationList.declarations) {
        if (ts.isIdentifier(d.name) && d.name.text === name && d.initializer) return d.initializer;
      }
    }
  }
  throw new Error(`[review] ${name} not found in ${sf.fileName}`);
}

function keyOf(p: ts.ObjectLiteralElementLike): string {
  const n = p.name;
  if (!n) return "";
  if (ts.isIdentifier(n) || ts.isStringLiteral(n) || ts.isNumericLiteral(n)) return n.text;
  return n.getText();
}

function prop(obj: ts.ObjectLiteralExpression, key: string): ts.Expression | undefined {
  for (const p of obj.properties) if (ts.isPropertyAssignment(p) && keyOf(p) === key) return p.initializer;
  return undefined;
}

function strSpan(node: ts.Node): Span {
  if (!ts.isStringLiteral(node)) throw new Error(`[review] expected a string literal at ${node.getStart()}`);
  return { start: node.getStart(), end: node.getEnd() };
}

/** A truth("…") or truth("…", true) call. */
function truthCall(node: ts.Expression): { text: string; textSpan: Span; reviewed: boolean; flag: Flag } {
  if (!ts.isCallExpression(node) || node.expression.getText() !== "truth") throw new Error(`[review] expected truth(...) at ${node.getStart()}`);
  const [arg0, arg1] = node.arguments;
  const textSpan = strSpan(arg0);
  const reviewed = Boolean(arg1 && arg1.kind === ts.SyntaxKind.TrueKeyword);
  const flag: Flag = arg1 ? { kind: "arg", span: { start: arg1.getStart(), end: arg1.getEnd() } } : { kind: "arg", insertAt: node.getEnd() - 1 };
  return { text: (arg0 as ts.StringLiteral).text, textSpan, reviewed, flag };
}

function boolProp(obj: ts.ObjectLiteralExpression, key: string): { reviewed: boolean; flag: Flag } {
  const v = prop(obj, key);
  if (!v) throw new Error(`[review] missing ${key}`);
  return { reviewed: v.kind === ts.SyntaxKind.TrueKeyword, flag: { kind: "prop", span: { start: v.getStart(), end: v.getEnd() } } };
}

function lanesOf(concern: string): string {
  const c = CONCERNS.find((x) => x.key === concern);
  return c ? c.lanes.join("/") : "all";
}

export function collectItems(): ReviewItem[] {
  const items: ReviewItem[] = [];
  const { sf } = parse(FILES.intake);
  const file = "content/intake.ts";

  // REFLECT[...].truth
  const reflect = topLevel(sf, "REFLECT") as ts.ObjectLiteralExpression;
  for (const p of reflect.properties) {
    if (!ts.isPropertyAssignment(p) || !ts.isObjectLiteralExpression(p.initializer)) continue;
    const key = keyOf(p);
    const t = truthCall(prop(p.initializer, "truth")!);
    const id = `truth:${key}`;
    items.push({ id, group: id, lane: lanesOf(key.split(".")[0]), type: "truth", file, ...t });
  }
  // AREA_REFLECT[...].truth
  const area = topLevel(sf, "AREA_REFLECT") as ts.ObjectLiteralExpression;
  for (const p of area.properties) {
    if (!ts.isPropertyAssignment(p) || !ts.isObjectLiteralExpression(p.initializer)) continue;
    const key = keyOf(p);
    const t = truthCall(prop(p.initializer, "truth")!);
    const id = `truth:area.${key}`;
    items.push({ id, group: id, lane: lanesOf(key), type: "truth", file, ...t });
  }
  // TRY_TODAY[...]: name, steps[], note share one reviewedByEric
  const tryToday = topLevel(sf, "TRY_TODAY") as ts.ObjectLiteralExpression;
  for (const p of tryToday.properties) {
    if (!ts.isPropertyAssignment(p) || !ts.isObjectLiteralExpression(p.initializer)) continue;
    const key = keyOf(p);
    const obj = p.initializer;
    const { reviewed, flag } = boolProp(obj, "reviewedByEric");
    const group = `try:${key}`;
    const lane = lanesOf(key);
    const push = (id: string, node: ts.Node) => items.push({ id, group, lane, type: "try today", text: (node as ts.StringLiteral).text, reviewed, file, textSpan: strSpan(node), flag });
    push(`${group}:name`, prop(obj, "name")!);
    const steps = prop(obj, "steps") as ts.ArrayLiteralExpression;
    steps.elements.forEach((el, i) => push(`${group}:step:${i + 1}`, el));
    push(`${group}:note`, prop(obj, "note")!);
  }
  // WEEK_NOTES[]
  const weeks = topLevel(sf, "WEEK_NOTES") as ts.ArrayLiteralExpression;
  weeks.elements.forEach((el, i) => {
    const id = `week:${i + 1}`;
    items.push({ id, group: id, lane: "all", type: "week note", file, ...truthCall(el) });
  });
  // QUESTIONS[lane][]
  const questions = topLevel(sf, "QUESTIONS") as ts.ObjectLiteralExpression;
  for (const p of questions.properties) {
    if (!ts.isPropertyAssignment(p) || !ts.isArrayLiteralExpression(p.initializer)) continue;
    const lane = keyOf(p);
    p.initializer.elements.forEach((el, i) => {
      const id = `question:${lane}:${i + 1}`;
      items.push({ id, group: id, lane, type: "question", file, ...truthCall(el) });
    });
  }

  // exercises[].name with `approved`
  const ex = parse(FILES.exercises);
  const list = topLevel(ex.sf, "exercises") as ts.ArrayLiteralExpression;
  for (const el of list.elements) {
    if (!ts.isObjectLiteralExpression(el)) continue;
    const idNode = prop(el, "id") as ts.StringLiteral;
    const nameNode = prop(el, "name")!;
    const { reviewed, flag } = boolProp(el, "approved");
    const id = `exercise:${idNode.text}`;
    items.push({ id, group: id, lane: "all", type: "exercise", text: (nameNode as ts.StringLiteral).text, reviewed, file: "content/exercises.ts", textSpan: strSpan(nameNode), flag });
  }
  return items;
}

/* ---------------------------------------------------------------- CSV ---- */

export const CSV_HEADER = ["id", "lane", "type", "current text", "approve (Y/N)", "Eric's edit"] as const;

export function toCsv(rows: string[][]): string {
  const cell = (v: string) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return rows.map((r) => r.map(cell).join(",")).join("\r\n") + "\r\n";
}

/** RFC 4180 parser: quoted cells, doubled quotes, commas and newlines inside quotes. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let i = 0;
  let quoted = false;
  const src = text.replace(/^﻿/, "");
  while (i < src.length) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          cell += '"';
          i += 2;
          continue;
        }
        quoted = false;
        i++;
        continue;
      }
      cell += ch;
      i++;
      continue;
    }
    if (ch === '"') {
      quoted = true;
      i++;
    } else if (ch === ",") {
      row.push(cell);
      cell = "";
      i++;
    } else if (ch === "\r" || ch === "\n") {
      row.push(cell);
      cell = "";
      rows.push(row);
      row = [];
      if (ch === "\r" && src[i + 1] === "\n") i++;
      i++;
    } else {
      cell += ch;
      i++;
    }
  }
  if (cell.length || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

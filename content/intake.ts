/**
 * "Find your plan" intake: ALL content in one typed file.
 *
 * Flow: who is this for (`for`) -> what's getting harder (`c`) -> closest situation (`s`)
 * or a body area (`area`) -> /plan/result. State lives in the URL so every plan is a link.
 *
 * Rules
 *  - Life words, never clinic jargon, on every option a visitor taps.
 *  - Wellness language only. Plans suggest; they never say what is wrong with someone.
 *  - Every exercise, truth statement and health-related line carries `reviewedByEric`.
 *    `npm run audit:content` lists everything still false. Production builds fail while
 *    any remain; preview builds show a "Draft" banner instead.
 *  - Copy is written in "you" form with {tokens}; the `loved` lane renders "they".
 *  - No statistics anywhere without a `source`. `npm run audit:safety` enforces it.
 *
 * Exercise movements come from the existing library in ./exercises (never a second list).
 */
import type { Goal, Region } from "./exercises";

export type Lane = "me" | "loved" | "mil" | "clinic" | "athlete";
export type Genre = "climb" | "strengthen" | "stretch" | "loosen" | "steady" | "rise";

export interface Reviewed<T = string> {
  value: T;
  reviewedByEric: boolean;
}

/** A number with a citation. The safety audit rejects any bare statistic that is not one of these. */
export interface Stat {
  value: string;
  source: string;
}

export const LANES: { key: Lane; label: string; line: string }[] = [
  { key: "me", label: "Me", line: "I want to keep doing what I do." },
  { key: "loved", label: "Someone I care about", line: "A parent, a spouse, a friend." },
  { key: "mil", label: "I serve or served", line: "Active duty, veteran, reserve or guard." },
  { key: "clinic", label: "My patients or my clinic", line: "PT, OT, gyms and communities." },
  { key: "athlete", label: "I train or compete", line: "Off-season, in-season, or coming back." },
];

/** The six kinds of practice, in the order they sit on the hexagon (top, clockwise). */
export const GENRES: Record<Genre, { label: string; clinical: string; line: string }> = {
  climb: { label: "Climb", clinical: "Assisted range of motion", line: "Reach higher with the board as a guide." },
  strengthen: { label: "Strengthen", clinical: "Strengthening", line: "Bands and bodyweight against a wall that does not move." },
  stretch: { label: "Stretch", clinical: "Stretching", line: "Lengthen with a handhold at any height." },
  loosen: { label: "Loosen", clinical: "Joint mobilization", line: "Free up stiff joints with slow, guided motion." },
  steady: { label: "Steady", clinical: "Balance", line: "Practice standing steady with something to hold." },
  rise: { label: "Rise", clinical: "Transfer training", line: "Get up, get down and get moving with a rail." },
};
export const GENRE_ORDER: Genre[] = ["climb", "strengthen", "stretch", "loosen", "steady", "rise"];

export interface Situation {
  key: string;
  label: string;
}

export type Step3 = { kind: "situations"; options: Situation[] } | { kind: "bodymap"; requireClearance: boolean };

export interface Concern {
  key: string;
  lanes: Lane[];
  label: string;
  genres: Genre[];
  step3: Step3;
  /** Where the four-week plan draws its movements from in the existing library. */
  region: Region;
  goal: Goal;
}

export const STEP2_QUESTION: Record<Lane, string> = {
  me: "What's getting harder?",
  loved: "What's getting harder for them?",
  mil: "Where are you in recovery?",
  clinic: "What's hardest for your clinic?",
  athlete: "What are you working on?",
};

export const CONCERNS: Concern[] = [
  // me + loved
  {
    key: "updown",
    lanes: ["me", "loved"],
    label: "Getting up and down",
    genres: ["rise", "strengthen", "steady"],
    region: "knees",
    goal: "strength",
    step3: {
      kind: "situations",
      options: [
        { key: "chair", label: "From a chair" },
        { key: "floor", label: "Off the floor" },
        { key: "car", label: "In and out of the car" },
        { key: "stairs", label: "Stairs" },
      ],
    },
  },
  {
    key: "steady",
    lanes: ["me", "loved"],
    label: "Feeling steady on {my} feet",
    genres: ["steady", "rise", "strengthen"],
    region: "whole",
    goal: "balance",
    step3: {
      kind: "situations",
      options: [
        { key: "falling", label: "Worried about falling" },
        { key: "turning", label: "Turning or reaching" },
        { key: "outside", label: "Uneven ground outside" },
        { key: "dressing", label: "Getting dressed standing up" },
      ],
    },
  },
  {
    key: "reach",
    lanes: ["me", "loved"],
    label: "Reaching up, stiff shoulders",
    genres: ["climb", "loosen", "stretch"],
    region: "shoulders",
    goal: "mobility",
    step3: {
      kind: "situations",
      options: [
        { key: "shelves", label: "Top shelves" },
        { key: "hair", label: "Washing or brushing {my} hair" },
        { key: "dressing", label: "Getting dressed" },
        { key: "morning", label: "Stiff shoulders in the morning" },
      ],
    },
  },
  {
    key: "stiff",
    lanes: ["me", "loved"],
    label: "Tight back, hips, or knees",
    genres: ["stretch", "loosen"],
    region: "hips",
    goal: "mobility",
    step3: {
      kind: "situations",
      options: [
        { key: "mornings", label: "Mornings" },
        { key: "sitting", label: "After sitting" },
        { key: "lowback", label: "Low back" },
        { key: "hipsknees", label: "Hips and knees" },
      ],
    },
  },
  {
    key: "comeback",
    lanes: ["me", "loved"],
    label: "Coming back from an injury or surgery",
    genres: ["climb", "strengthen", "loosen"],
    region: "whole",
    goal: "mobility",
    step3: { kind: "bodymap", requireClearance: true },
  },
  {
    key: "ahead",
    lanes: ["me", "loved"],
    label: "Nothing yet, {I} want to stay ahead of it",
    genres: ["climb", "strengthen", "stretch", "loosen", "steady", "rise"],
    region: "whole",
    goal: "balance",
    step3: {
      kind: "situations",
      options: [
        { key: "grandkids", label: "Keep up with the grandkids" },
        { key: "travel", label: "Travel" },
        { key: "sport", label: "Keep playing {my} sport" },
        { key: "home", label: "Stay independent at home" },
      ],
    },
  },
  // mil: body map
  { key: "surgery", lanes: ["mil"], label: "Recovering from surgery or injury", genres: ["climb", "strengthen", "loosen"], region: "whole", goal: "mobility", step3: { kind: "bodymap", requireClearance: true } },
  { key: "chronic", lanes: ["mil"], label: "Managing a long-term condition", genres: ["stretch", "loosen", "steady"], region: "whole", goal: "mobility", step3: { kind: "bodymap", requireClearance: false } },
  { key: "ready", lanes: ["mil"], label: "Staying mission-ready", genres: ["strengthen", "steady", "rise"], region: "whole", goal: "strength", step3: { kind: "bodymap", requireClearance: false } },
  { key: "transition", lanes: ["mil"], label: "Transitioning out of service", genres: ["strengthen", "stretch", "steady"], region: "whole", goal: "strength", step3: { kind: "bodymap", requireClearance: false } },
  // clinic
  {
    key: "space",
    lanes: ["clinic"],
    label: "Floor space",
    genres: ["climb", "strengthen", "stretch", "loosen", "steady", "rise"],
    region: "whole",
    goal: "balance",
    step3: {
      kind: "situations",
      options: [
        { key: "newloc", label: "Opening a new location" },
        { key: "satellite", label: "Small satellite clinic" },
        { key: "peak", label: "Crowded gym at peak hours" },
      ],
    },
  },
  {
    key: "cost",
    lanes: ["clinic"],
    label: "Equipment cost",
    genres: ["climb", "strengthen", "stretch", "loosen", "steady", "rise"],
    region: "whole",
    goal: "balance",
    step3: {
      kind: "situations",
      options: [
        { key: "replace", label: "Replacing worn-out equipment" },
        { key: "budget", label: "Opening on a tight budget" },
        { key: "station", label: "Adding one more station" },
      ],
    },
  },
  {
    key: "homeprog",
    lanes: ["clinic"],
    label: "Patients not doing home programs",
    genres: ["climb", "strengthen", "stretch", "loosen", "steady", "rise"],
    region: "whole",
    goal: "balance",
    step3: {
      kind: "situations",
      options: [
        { key: "discharge", label: "They stop after discharge" },
        { key: "noequip", label: "Nothing to hold on to at home" },
        { key: "forget", label: "They forget what to do" },
      ],
    },
  },
  {
    key: "throughput",
    lanes: ["clinic"],
    label: "Patient throughput",
    genres: ["climb", "strengthen", "stretch", "loosen", "steady", "rise"],
    region: "whole",
    goal: "balance",
    step3: {
      kind: "situations",
      options: [
        { key: "waiting", label: "Patients waiting on one machine" },
        { key: "onetoone", label: "One-on-one time is stretched thin" },
        { key: "groups", label: "Running group sessions" },
      ],
    },
  },
  // athlete: body map
  { key: "prevent", lanes: ["athlete"], label: "Injury prevention", genres: ["strengthen", "loosen", "steady"], region: "whole", goal: "strength", step3: { kind: "bodymap", requireClearance: false } },
  { key: "mobility", lanes: ["athlete"], label: "Mobility", genres: ["climb", "stretch", "loosen"], region: "whole", goal: "mobility", step3: { kind: "bodymap", requireClearance: false } },
  { key: "rtp", lanes: ["athlete"], label: "Return to play", genres: ["climb", "strengthen", "steady"], region: "whole", goal: "strength", step3: { kind: "bodymap", requireClearance: true } },
  { key: "recovery", lanes: ["athlete"], label: "Recovery days", genres: ["stretch", "loosen", "steady"], region: "whole", goal: "mobility", step3: { kind: "bodymap", requireClearance: false } },
];

export const SAFETY_EXIT = {
  label: "I've fallen recently or have new or sudden pain",
  href: "/plan/see-a-provider",
} as const;

/* ---------------------------------------------------------------- Reflect ---- */

export interface Reflect {
  headline: string;
  points: [string, string, string];
  truth: Reviewed;
}

/** A reviewed line. The second argument is written by scripts/import-review.ts once Eric approves it. */
const truth = (value: string, reviewedByEric = false): Reviewed => ({ value, reviewedByEric });

/** Keyed `${concern}.${situation}` for concerns whose Step 3 is a situation list. */
export const REFLECT: Record<string, Reflect> = {
  // updown
  "updown.chair": {
    headline: "Getting out of a chair shouldn't take planning.",
    points: ["The push comes from the legs, not the arms. That is what {you} practice.", "A rail at the right height turns a struggle into a routine.", "Ten minutes, a few days a week, is where it starts."],
    truth: truth("Strength {you} can reach from a wall is strength {you} will actually use."),
  },
  "updown.floor": {
    headline: "Down to the floor and back up, with something solid to hold.",
    points: ["Kneeling, half-kneeling and standing are the steps. The board gives {you} a handhold at each one.", "Practice the sequence slowly, on purpose, when nothing is at stake.", "The garden, the grandkids and the dropped keys all get easier."],
    truth: truth("The floor stops being a worry when getting up from it is something {you} practice."),
  },
  "updown.car": {
    headline: "In and out of the car, without bracing on the door.",
    points: ["It is a sit-to-stand with a twist. Both parts can be practiced on the wall.", "A rail at hip height teaches the same push {you} need at the car seat.", "Small, steady reps build the confidence to just go."],
    truth: truth("A movement {you} rehearse at home is a movement {you} stop thinking about in the parking lot."),
  },
  "updown.stairs": {
    headline: "Stairs are just one step, repeated. Practice the step.",
    points: ["Step-ups and controlled step-downs with a rail, at {your} own pace.", "Knees and hips share the work when the legs are ready for it.", "Confidence on the first step carries up the whole flight."],
    truth: truth("Every flight of stairs is a set of single steps {you} already know how to do."),
  },
  // steady
  "steady.falling": {
    headline: "Worrying about falling is tiring. Practice is calmer.",
    points: ["Balance is a skill. It responds to practice like any other.", "A wall with a handhold lets {you} practice narrow stances and single-leg stands safely.", "Start with both hands on. Progress to one, then to fingertips."],
    truth: truth("Feeling steady comes from practicing being steady, with something to hold while {you} learn."),
  },
  "steady.turning": {
    headline: "Turning to look, reaching to the side, without a wobble.",
    points: ["Turning and reaching move {your} weight off center. That is the skill to rehearse.", "Reach for anchor points at different heights while {you} hold the rail.", "A few slow reps a day teach {your} feet what to do."],
    truth: truth("Reaching gets steadier when {you} practice reaching, not when {you} avoid it."),
  },
  "steady.outside": {
    headline: "Gravel, grass and curbs: the ground moves, {you} don't have to.",
    points: ["Ankles and hips do most of the quiet work on uneven ground.", "Weight shifts, heel raises and side steps at the wall build that work back.", "Practice inside, with a rail, before {you} take it outside."],
    truth: truth("Uneven ground is easier for feet that have practiced shifting weight on purpose."),
  },
  "steady.dressing": {
    headline: "Socks, shoes and trousers, standing up.",
    points: ["Standing on one leg for a few seconds is the whole trick.", "The board gives {you} a handhold while {you} lift a foot, then a lighter hold, then none.", "Practice next to the wall, then in the bedroom."],
    truth: truth("Standing on one foot is a small skill that quietly protects a lot of {your} day."),
  },
  // reach
  "reach.shelves": {
    headline: "The top shelf shouldn't be off limits.",
    points: ["Reaching overhead needs the shoulder to glide and the upper back to lift.", "The board's anchor points give {your} fingertips a target at every height. Climb them.", "A little higher each week is the plan."],
    truth: truth("Reach comes back a row at a time when {you} have something to reach for."),
  },
  "reach.hair": {
    headline: "Washing {your} hair shouldn't be a workout.",
    points: ["Hands behind the head need rotation and a relaxed neck.", "Slow wall slides and gentle band pulls loosen the shoulders where they are tight.", "Two minutes before the shower helps more than {you} would expect."],
    truth: truth("Small, daily reaches keep the shoulder ready for the small, daily things."),
  },
  "reach.dressing": {
    headline: "Sleeves, bra straps and coats, without the wince.",
    points: ["Getting dressed needs the shoulder to move behind {you}, not just in front.", "The board lets {you} practice reaching back with a handhold to steady {you}.", "Loosen first, then strengthen. That order matters."],
    truth: truth("Getting dressed is a set of reaches, and every one of them can be practiced."),
  },
  "reach.morning": {
    headline: "Stiff in the morning, easier by lunch. Let's start earlier.",
    points: ["Morning stiffness usually eases with slow, guided motion.", "A gentle climb up the board and a few band pulls, before coffee.", "Consistency beats intensity here."],
    truth: truth("A stiff shoulder wants slow motion, not rest, and the wall makes slow motion easy."),
  },
  // stiff
  "stiff.mornings": {
    headline: "Mornings shouldn't start with a creak.",
    points: ["Hips, knees and back all loosen with a few minutes of guided motion.", "Holding the rail, {you} can hinge, rock and sway without worrying about balance.", "Five minutes at the wall sets up the day."],
    truth: truth("Stiffness lifts fastest when the first movement of the day is slow and supported."),
  },
  "stiff.sitting": {
    headline: "Standing up after a long sit shouldn't take a minute to unfold.",
    points: ["Long sitting shortens the front of the hips. Standing tall at the wall opens it back up.", "A hip opener with a handhold, then a few sit-to-stands, resets things.", "Do it every time {you} get up from the desk or the couch."],
    truth: truth("The stiffness of sitting comes undone with the movement sitting took away."),
  },
  "stiff.lowback": {
    headline: "A tight low back wants motion it can trust.",
    points: ["Gentle hinges and side reaches with a handhold keep the back moving without loading it.", "The core works quietly when {you} press a band out in front of {you}.", "Short, frequent, easy. That is the pattern."],
    truth: truth("A back that moves a little every day stays a back that can move."),
  },
  "stiff.hipsknees": {
    headline: "Hips and knees that feel ten years older than the rest of {you}.",
    points: ["Hips and knees loosen with rocking, stepping and slow squats, all with a rail.", "Strength around the joint makes stiffness matter less.", "Progress is measured in easier stairs, not in reps."],
    truth: truth("Stiff hips and knees usually want more movement, not less, with something to hold."),
  },
  // ahead
  "ahead.grandkids": {
    headline: "Keeping up with the grandkids is a training goal. Treat it like one.",
    points: ["Floor play, lifting and quick turns all live in the same six kinds of practice.", "A full-body ten minutes a few times a week keeps all of them ready.", "The board is there before {you} need it, which is the point."],
    truth: truth("Staying ahead means practicing the things {you} can still do, so {you} keep doing them."),
  },
  "ahead.travel": {
    headline: "Long flights, cobbled streets and hotel stairs. Be ready for all of it.",
    points: ["Travel asks for stamina in the legs, balance on new ground and shoulders that can lift a bag.", "Rotate through the six kinds of practice in the weeks before a trip.", "The plan is short enough to keep up when {you} are home."],
    truth: truth("A body that trains for the trip enjoys the trip."),
  },
  "ahead.sport": {
    headline: "Keep playing {your} sport. Practice what the sport doesn't.",
    points: ["Most sports skip something: overhead reach, single-leg balance, or the hinge.", "The board fills the gaps with bands, holds and a rail in the same ten minutes.", "Stay in the game longer by training what the game forgets."],
    truth: truth("The movements a sport neglects are the ones that end up deciding how long {you} play it."),
  },
  "ahead.home": {
    headline: "Staying independent at home is a plan, not a hope.",
    points: ["The home asks for six things: reach, strength, stretch, loose joints, balance and getting up.", "One wall practices all six.", "Small, regular practice keeps the house working for {you}."],
    truth: truth("Independence at home rests on a handful of movements {you} can keep practicing."),
  },
  // clinic
  "space.newloc": {
    headline: "A new location, and every square foot has to earn its rent.",
    points: ["One wall-mounted board practices six kinds of work in a three-by-three-foot footprint.", "Sections stack and install with standard wall anchors, indoors or out.", "Patients see one station and one program, which is easier to teach and easier to sell."],
    truth: truth("Floor space is the first equipment decision a clinic makes."),
  },
  "space.satellite": {
    headline: "A satellite clinic needs a gym that fits in a closet.",
    points: ["A board on the wall leaves the floor open for tables and gait work.", "Bands and a rail cover assisted range of motion through transfers.", "Two boards side by side serve two patients in a spare room."],
    truth: truth("A small clinic is not a compromise when the wall does the work."),
  },
  "space.peak": {
    headline: "Peak hours, and the gym floor is a queue.",
    points: ["A wall station takes a patient out of the machine line.", "Home programs written for the board keep patients moving between visits.", "Assign it by height and program, not by availability."],
    truth: truth("Throughput at peak is a floor-plan problem before it is a staffing problem."),
  },
  "cost.replace": {
    headline: "Replacing worn-out equipment is the moment to consolidate it.",
    points: ["One board replaces the wall ladder, pulley station, balance bar and stretch rack for many programs.", "Molded HDPE with no moving parts to service.", "Order the count {you} need, mount, done."],
    truth: truth("Equipment that does six jobs is cheaper to own than six pieces that do one."),
  },
  "cost.budget": {
    headline: "Opening on a tight budget without opening short of equipment.",
    points: ["Start with one board and a band bundle per treatment room.", "Add sections and boards as the caseload grows.", "Clinic pricing and a demo are one form away."],
    truth: truth("The cheapest station is the one that covers the most programs."),
  },
  "cost.station": {
    headline: "One more station, without another footprint.",
    points: ["A board mounts on a wall {you} already have.", "It serves the same six kinds of practice as the rest of the gym.", "It moves if the floor plan changes."],
    truth: truth("A wall is the last unused floor space in most clinics."),
  },
  "homeprog.discharge": {
    headline: "Home programs stop at discharge because the equipment does.",
    points: ["A patient who learned the exercises on a board can buy the same board for home.", "The anchor rows match, so the program transfers row for row.", "The 'Find your plan' flow on this site keeps them practicing after the last visit."],
    truth: truth("Patients keep doing what they can do at home with the same handholds they used in the clinic."),
  },
  "homeprog.noequip": {
    headline: "Nothing to hold on to at home is the reason most programs stall.",
    points: ["A rail on the wall gives a patient the same confidence they had at the parallel bars.", "Bands clip anywhere on the board, so the program does not need a door frame.", "Indoor or outdoor, so it can go where the patient actually spends time."],
    truth: truth("A handhold changes what a patient is willing to try alone."),
  },
  "homeprog.forget": {
    headline: "They forget the exercises. Give them a wall that remembers.",
    points: ["Anchor rows are numbered. 'Row 30, shoulder height' is easier to recall than a diagram.", "The plan builder on this site writes the program in the same terms.", "A printed or emailed plan lands next to the board."],
    truth: truth("A program written in rows and landmarks is a program a patient can follow."),
  },
  "throughput.waiting": {
    headline: "Patients waiting on one machine are minutes {you} do not get back.",
    points: ["A board on the wall is a second station for most strengthening and range-of-motion work.", "Bands swap in seconds, so the station changes with the patient.", "No settings to reset between people."],
    truth: truth("A station that changes with a band swap keeps the floor moving."),
  },
  "throughput.onetoone": {
    headline: "When one-on-one time is stretched, the station has to teach itself.",
    points: ["Numbered rows and a printed plan let a patient set up alone.", "The rail keeps them safe while {you} are across the room.", "Progressions are 'one row higher', which patients understand."],
    truth: truth("A self-explaining station returns clinician minutes to the people who need them."),
  },
  "throughput.groups": {
    headline: "Group sessions need one station per person, not one machine per exercise.",
    points: ["Boards mount side by side at three-foot spacing.", "One cue works for the whole room: same board, same rows.", "Height differences are handled by the row, not the equipment."],
    truth: truth("Groups run smoothly when everyone is looking at the same wall."),
  },
};

/** Concerns whose Step 3 is the body map: one template per concern, phrased per area. */
export interface AreaReflect {
  headline: string;
  points: [string, string, string];
  truth: Reviewed;
}
export const AREA_PHRASE: Record<Region, { noun: string; short: string }> = {
  shoulders: { noun: "{your} shoulders", short: "shoulders" },
  arms: { noun: "{your} arms and grip", short: "arms" },
  core: { noun: "{your} core and back", short: "core" },
  hips: { noun: "{your} hips", short: "hips" },
  knees: { noun: "{your} knees", short: "knees" },
  ankles: { noun: "{your} ankles and feet", short: "ankles" },
  whole: { noun: "{your} whole body", short: "whole body" },
};
export const AREA_REFLECT: Record<string, AreaReflect> = {
  comeback: {
    headline: "Coming back through {area}, one row at a time.",
    points: ["Recovery is a sequence: move it, then hold it, then load it. The board has a row for each.", "Start with the rail and a light band, and climb from there.", "Bring this plan to the clinician who cleared {you}. It is written in their terms."],
    truth: truth("A comeback that is practiced a little every day is a comeback that holds."),
  },
  surgery: {
    headline: "Recovery for {area}, with a wall {you} can trust.",
    points: ["Assisted range of motion first, then strength, then loose, easy movement.", "Anchor rows give {you} a measurable target for each week.", "This plan is written to bring to {your} VA provider or PT."],
    truth: truth("Recovery moves forward on small, repeatable practice with something steady to hold."),
  },
  chronic: {
    headline: "Managing a long-term condition means keeping {area} moving on the good days and the hard ones.",
    points: ["Stretch and loosen work keeps {area} available for the rest of the day.", "Balance practice with a rail keeps the hard days from taking {your} confidence.", "Short sessions, most days, beat long sessions on a few."],
    truth: truth("Managing a condition is mostly the habit of moving anyway, gently, with a handhold."),
  },
  ready: {
    headline: "Mission-ready starts with {area} that hold up under load.",
    points: ["Strength and balance on the wall, then carry it into rucks, runs and lifts.", "Single-leg work with a rail builds the control that keeps {you} off the injured list.", "Ten minutes before or after the main session."],
    truth: truth("Readiness is built in the small sessions between the big ones."),
  },
  transition: {
    headline: "Leaving service is a good time to give {area} a new program.",
    points: ["The structure changes, so the routine has to come with {you}.", "One wall at home covers strength, stretch and balance without a gym.", "Bring this plan to {your} VA provider as a starting point."],
    truth: truth("A routine that fits on one wall is a routine that survives a move."),
  },
  prevent: {
    headline: "Injury prevention for {area}: train the control, not just the power.",
    points: ["Bands at odd angles train the small stabilizers the big lifts skip.", "Single-leg balance with a light hold sharpens landing and cutting.", "Add it to warm-ups, three times a week."],
    truth: truth("Athletes stay healthy on the control work they do when no one is watching."),
  },
  mobility: {
    headline: "More range for {area}, with a target {you} can see.",
    points: ["Climb the anchor rows a little higher each week.", "Loosen first, then stretch, then hold the new range under a light load.", "Track the row {you} reach. That is {your} progress."],
    truth: truth("Range comes back when {you} can measure it, and the board makes it measurable."),
  },
  rtp: {
    headline: "Return to play for {area}, in the order {your} clinician wants.",
    points: ["Assisted motion, then strength, then balance under fatigue.", "Every movement on this plan has an easier and a harder version.", "Bring it to the person clearing {you}. Progress on their word, not the calendar."],
    truth: truth("Returning to play is a ladder, and the board gives {you} the rungs."),
  },
  recovery: {
    headline: "Recovery days for {area}: move, loosen, breathe.",
    points: ["Slow stretches with a handhold, at heights {you} choose.", "Gentle balance work to keep the nervous system tuned without load.", "Fifteen easy minutes, then rest."],
    truth: truth("Recovery is active when it is gentle and on purpose."),
  },
};

/* ---------------------------------------------------------- Try one thing ---- */

export interface TryToday {
  name: string;
  steps: string[];
  note: string;
  reviewedByEric: boolean;
}

/** One safe movement per concern that needs no board. Value before the ask. */
export const TRY_TODAY: Record<string, TryToday> = {
  updown: { name: "Slow sit-to-stand", steps: ["Sit toward the front of a firm chair, feet flat and slightly back.", "Lean forward, nose over toes, and stand up slowly.", "Sit back down just as slowly. Five times."], note: "Use the chair arms only if {you} need them.", reviewedByEric: false },
  steady: { name: "Kitchen-counter weight shift", steps: ["Stand at the counter with both hands resting on it.", "Shift {your} weight slowly to the left foot, pause, then to the right.", "Ten shifts. Then try with fingertips only."], note: "Keep the counter within reach the whole time.", reviewedByEric: false },
  reach: { name: "Doorway climb", steps: ["Stand facing a door frame. Rest {your} fingertips on it at shoulder height.", "Walk {your} fingers up the frame as far as feels comfortable.", "Hold for a breath and walk them back down. Six times each arm."], note: "Stop below any pinch at the top.", reviewedByEric: false },
  stiff: { name: "Standing hinge", steps: ["Stand with a hand on the back of a chair.", "Push {your} hips back and let {your} chest come forward, back long.", "Return to tall. Eight slow reps."], note: "Small range is fine. It is about motion, not depth.", reviewedByEric: false },
  comeback: { name: "Breathing and a gentle march", steps: ["Stand with a hand on a wall.", "Breathe out slowly and lift one knee a few inches. Lower it.", "Alternate for one minute."], note: "Only within what {your} clinician has cleared.", reviewedByEric: false },
  ahead: { name: "One-minute single-leg stand", steps: ["Stand beside a counter with one hand on it.", "Lift one foot an inch off the floor and hold for up to thirty seconds.", "Switch feet. Repeat once."], note: "Lighten the hand as it gets easier.", reviewedByEric: false },
  surgery: { name: "Breathing and a gentle march", steps: ["Stand with a hand on a wall.", "Breathe out slowly and lift one knee a few inches. Lower it.", "Alternate for one minute."], note: "Only within what {your} provider has cleared.", reviewedByEric: false },
  chronic: { name: "Wall sway", steps: ["Stand with both hands flat on a wall, feet hip-width apart.", "Sway {your} hips gently side to side, then in a slow circle.", "One minute, easy breathing."], note: "Keep the movement small and comfortable.", reviewedByEric: false },
  ready: { name: "Wall split squat", steps: ["Stand a long step from a wall, one foot forward, hand on the wall.", "Lower straight down until the back knee is near the floor.", "Drive back up. Eight each side."], note: "Keep the front knee over the foot.", reviewedByEric: false },
  transition: { name: "Doorway chest opener", steps: ["Stand in a doorway with forearms on the frame at shoulder height.", "Step one foot through until {you} feel a stretch across the chest.", "Hold for five slow breaths. Twice."], note: "Ease off if the shoulder pinches.", reviewedByEric: false },
  prevent: { name: "Single-leg reach", steps: ["Stand on one leg beside a wall, one hand hovering near it.", "Reach the other foot forward, to the side and behind, tapping the floor lightly.", "Five rounds each leg."], note: "Touch the wall whenever {you} need it.", reviewedByEric: false },
  mobility: { name: "Doorway climb", steps: ["Stand facing a door frame. Rest {your} fingertips on it at shoulder height.", "Walk {your} fingers up the frame as far as feels comfortable.", "Hold for a breath and walk them back down. Six times each arm."], note: "Stop below any pinch at the top.", reviewedByEric: false },
  rtp: { name: "Controlled step-down", steps: ["Stand on the bottom stair with a hand on the rail.", "Lower one heel toward the floor slowly, then push back up.", "Six each side."], note: "Only within what {your} clinician has cleared.", reviewedByEric: false },
  recovery: { name: "Wall sway", steps: ["Stand with both hands flat on a wall, feet hip-width apart.", "Sway {your} hips gently side to side, then in a slow circle.", "One minute, easy breathing."], note: "Keep it easy. This is a recovery day.", reviewedByEric: false },
};

/* ------------------------------------------------------------- Four weeks ---- */

export const WEEK_NOTES: Reviewed[] = [
  truth("Week 1: learn the setup. Two movements, both hands on the rail, easy band."),
  truth("Week 2: add the third movement. Keep the rail, add a few reps."),
  truth("Week 3: the full set. One hand on the rail where {you} can."),
  truth("Week 4: the harder version of each movement, still with a handhold nearby."),
];

/* -------------------------------------------------------------- Questions ---- */

/** Questions to bring to a PT, doctor or VA provider. Health-related, so reviewed. */
export const QUESTIONS: Record<Lane, Reviewed[]> = {
  me: [
    truth("Is there anything in my history that changes which of these movements I should start with?"),
    truth("How many days a week is a good starting point for me?"),
    truth("What should I notice that means I should stop and check in with you?"),
    truth("Which of these would you progress first, and how?"),
    truth("Is a wall-mounted board with a rail a good fit for my home program?"),
  ],
  loved: [
    truth("Is there anything in their history that changes which of these movements they should start with?"),
    truth("How many days a week is a good starting point for them?"),
    truth("What should we watch for that means they should stop and check in with you?"),
    truth("Should someone be with them when they practice, at least at first?"),
    truth("Is a wall-mounted board with a rail a good fit for their home program?"),
  ],
  mil: [
    truth("Does anything in my service-connected history change which of these movements I should start with?"),
    truth("Can this plan be added to my VA home exercise program?"),
    truth("How many days a week is a good starting point?"),
    truth("What should I notice that means I should stop and check in?"),
    truth("Would a wall-mounted board with a rail be appropriate for my home program?"),
  ],
  clinic: [
    truth("Which of our current home programs would transfer to a numbered-row wall board?"),
    truth("Which patient groups would you assign to it first?"),
    truth("How would we document row and band progressions in our notes?"),
    truth("Where on the floor plan would a three-by-three-foot station open up the most time?"),
  ],
  athlete: [
    truth("Does anything in my injury history change which of these movements I should start with?"),
    truth("How should this fit around my current training load?"),
    truth("What should I notice that means I should back off?"),
    truth("Which of these would you progress first, and how?"),
  ],
};

/* ----------------------------------------------------------------- Clinic ---- */

export const CLINIC = {
  replacesTitle: "What one wall replaces",
  replacesIntro: "Six kinds of practice on one board, in a three-by-three-foot footprint.",
  /** Each of the six uses from facts.ts, in the same words a clinic would use. */
  replaces: [
    { genre: "climb" as Genre, replaces: "Wall ladder or finger ladder" },
    { genre: "strengthen" as Genre, replaces: "Band anchor station or pulley column" },
    { genre: "stretch" as Genre, replaces: "Stretch rack or stall bars" },
    { genre: "loosen" as Genre, replaces: "Mobilization station with a fixed handhold" },
    { genre: "steady" as Genre, replaces: "Balance bar or parallel bars, for standing work" },
    { genre: "rise" as Genre, replaces: "Transfer rail for sit-to-stand practice" },
  ],
  roiTitle: "Your numbers",
  roiIntro: "Tell us what a station costs {you} today. We will run the comparison with you on the demo call, with real numbers, rather than guess here.",
  roiInputs: [
    { key: "stations", label: "Treatment stations today", unit: "" },
    { key: "sqft", label: "Floor space per station", unit: "sq ft" },
    { key: "rent", label: "Monthly rent per square foot", unit: "$" },
    { key: "equipment", label: "Annual equipment budget", unit: "$" },
  ],
} as const;

/* ------------------------------------------------------ Safety exit page ---- */

export const SEE_A_PROVIDER = {
  title: "Please see a provider first",
  lines: [
    "If {you} have fallen recently, or have new or sudden pain, the right next step is a doctor or a physical therapist, not an exercise plan.",
    "Bring them what {you} noticed: when it started, what makes it better or worse, and anything that has changed.",
    "Once they have seen {you} and given the OK, come back and we will build a plan around what they said.",
  ],
  emergency: "If this is an emergency, call 911.",
} as const;

/* ---------------------------------------------------------- Lane pronouns ---- */

const PRONOUNS: Record<Lane, Record<string, string>> = {
  me: { you: "you", your: "your", yours: "yours", yourself: "yourself", "you're": "you're", "you've": "you've", "you'll": "you'll", "you'd": "you'd", I: "I", my: "my", "I've": "I've", "I'm": "I'm" },
  loved: { you: "they", your: "their", yours: "theirs", yourself: "themselves", "you're": "they're", "you've": "they've", "you'll": "they'll", "you'd": "they'd", I: "they", my: "their", "I've": "they've", "I'm": "they're" },
  mil: { you: "you", your: "your", yours: "yours", yourself: "yourself", "you're": "you're", "you've": "you've", "you'll": "you'll", "you'd": "you'd", I: "I", my: "my", "I've": "I've", "I'm": "I'm" },
  clinic: { you: "you", your: "your", yours: "yours", yourself: "yourself", "you're": "you're", "you've": "you've", "you'll": "you'll", "you'd": "you'd", I: "I", my: "my", "I've": "I've", "I'm": "I'm" },
  athlete: { you: "you", your: "your", yours: "yours", yourself: "yourself", "you're": "you're", "you've": "you've", "you'll": "you'll", "you'd": "you'd", I: "I", my: "my", "I've": "I've", "I'm": "I'm" },
};

/** Render {you}/{your}/{I}/{my} tokens for a lane. A capitalised token capitalises the word. */
export function t(text: string, lane: Lane): string {
  const table = PRONOUNS[lane];
  return text.replace(/\{([A-Za-z']+)\}/g, (_, raw: string) => {
    const lower = raw === "I" || raw.startsWith("I'") ? raw : raw[0].toLowerCase() + raw.slice(1);
    const word = table[lower] ?? raw;
    const cap = raw[0] === raw[0].toUpperCase() && raw !== "I" && !raw.startsWith("I'");
    return cap ? word[0].toUpperCase() + word.slice(1) : word;
  });
}

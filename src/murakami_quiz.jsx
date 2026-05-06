import { useState, useEffect } from 'react';

// =====================================================================
// AXES — five personality dimensions, scored 0-10
// =====================================================================
const AXES = [
  { left: 'Logic', right: 'Intuition' },
  { left: 'Grounded', right: 'Otherworldly' },
  { left: 'Burden', right: 'Lightness' },
  { left: 'Independent', right: 'Devoted' },
  { left: 'Reserved', right: 'Expressive' },
];

// =====================================================================
// CHARACTERS — eight Murakami protagonists with their trait vectors
// =====================================================================
const CHARACTERS = [
  {
    name: 'Kafka Tamura',
    novel: 'Kafka on the Shore',
    epithet: 'The disciplined runaway',
    traits: [4, 5, 1, 3, 2],
    description: "You carry your weight in private and trust almost no one with the full shape of it. There's a tougher voice inside you that insists you can handle whatever comes — a self-reassurance you reach for when you need it.",
  },
  {
    name: 'Mr. Nakata',
    novel: 'Kafka on the Shore',
    epithet: 'The kindhearted wanderer',
    traits: [10, 9, 9, 6, 7],
    description: "You move through the world without pretense or guile, attentive to small things others miss, willing to follow where you're called. Your simplicity is a quiet kind of wisdom.",
  },
  {
    name: 'Hoshino',
    novel: 'Kafka on the Shore',
    epithet: 'The transformed everyman',
    traits: [5, 1, 8, 8, 9],
    description: "You're loyal, easy to be around, the kind of person who lightens a room without trying. Underneath the casual exterior is someone capable of being moved more deeply than they let on.",
  },
  {
    name: 'Oshima',
    novel: 'Kafka on the Shore',
    epithet: 'The articulate outsider',
    traits: [3, 3, 4, 5, 6],
    description: "You think clearly, speak when it matters, and live by your own carefully considered code. The margins suit you — you've made them yours by choice.",
  },
  {
    name: 'Aomame',
    novel: '1Q84',
    epithet: 'The disciplined assassin',
    traits: [3, 4, 2, 8, 2],
    description: "You belong to your principles before you belong to anyone, and the people you do let in matter to you with a fierceness others rarely see. You carry your past locked away — that's how you survive it.",
  },
  {
    name: 'Tengo Kawana',
    novel: '1Q84',
    epithet: 'The patient ghostwriter',
    traits: [5, 4, 5, 6, 3],
    description: "You're steady where others run hot, gentle where others harden, and capable of holding more than you show. The people in your inner circle are kept there for life.",
  },
  {
    name: 'Fuka-Eri',
    novel: '1Q84',
    epithet: 'The faraway intuitive',
    traits: [10, 10, 6, 3, 5],
    description: "You're present in the room and somewhere else at the same time. You don't explain yourself, and you don't need to — what you say, when you say it, tends to be exactly true.",
  },
  {
    name: 'Ushikawa',
    novel: '1Q84',
    epithet: 'The misunderstood investigator',
    traits: [1, 1, 1, 9, 3],
    description: "You see what other people miss and pay the price of seeing too clearly. People underestimate you and you've stopped correcting them. There's more humanity in you than the world gives you credit for.",
  },
];

// =====================================================================
// QUESTIONS — 10 questions, each with 4 options
// Each option's `deltas` is a 5-length array adjusting the user's vector
// on the same axes as CHARACTERS above.
// =====================================================================
const QUESTIONS = [
  {
    prompt: "You're walking home alone at night. A cat is sitting on a low wall, watching you approach. As you pass, it speaks and asks whether you'd like to hear something it knows. What do you do?",
    options: [
      { text: "Stop and listen carefully. Cats don't usually do this without reason.", deltas: [2, 2, 0, 0, 1] },
      { text: "Keep walking, but you will be thinking about it for weeks.", deltas: [1, 0, -2, 0, -2] },
      { text: "Sit down beside it. Ask what it wants in return.", deltas: [0, 2, 0, 2, 2] },
      { text: "Pretend you didn't hear. You don't have time for things that don't make sense.", deltas: [-2, -2, 0, 0, -2] },
    ],
  },
  {
    prompt: "You have an entirely empty Sunday — no obligations, no one expecting anything from you. By evening, you'd most likely be:",
    options: [
      { text: "In a quiet place, working through something that's been on your mind. A book, a problem, a project.", deltas: [-2, 0, 0, -1, -2] },
      { text: "Cooking something simple, alone, listening to a record you've heard a thousand times.", deltas: [0, -2, -1, 0, -2] },
      { text: "On a long walk you didn't plan, ending up somewhere you didn't expect.", deltas: [2, 2, 2, 0, 0] },
      { text: "Out with someone you like, talking about nothing in particular, ignoring the time.", deltas: [0, 0, 2, 2, 2] },
    ],
  },
  {
    prompt: "A deep, abandoned well sits behind your apartment building. People avoid it; nobody talks about it. Walking past one night, what's your strongest impulse?",
    options: [
      { text: "To climb down. You suspect there's something at the bottom that's connected to you.", deltas: [2, 0, -2, -2, 0] },
      { text: "To find out who built it and why. Wells don't appear on their own.", deltas: [-2, -2, 0, 0, -2] },
      { text: "To stand at the edge for a while. This is a good place to reflect and appreciate the silence.", deltas: [2, 2, 0, 0, 0] },
      { text: "To bring someone you trust there tomorrow. Things this strange shouldn't be experienced alone.", deltas: [0, -2, 0, 2, 2] },
    ],
  },
  {
    prompt: "After several days alone — not lonely exactly, just uninterrupted — what's the first thing you start to crave?",
    options: [
      { text: "A real conversation. Not chitchat. Something with weight to it.", deltas: [0, 0, 0, 2, 2] },
      { text: "Movement. A long walk, a workout, somewhere to put the energy.", deltas: [0, -2, -1, 0, -2] },
      { text: "Nothing, really. Solitude tends to settle into something deeper if you don't fight it.", deltas: [2, 0, 2, -2, 0] },
      { text: "A quiet, demanding task. A problem to give the mind shape.", deltas: [-2, 0, 0, 1, -2] },
    ],
  },
  {
    prompt: "Which of these comes closest to how you carry the past?",
    options: [
      { text: "It sits with me. There are things I think about almost every day — not painfully, just present.", deltas: [0, 0, -1, 0, -2] },
      { text: "I keep it locked away. Looking at it doesn't help.", deltas: [0, 0, -2, -2, -2] },
      { text: "It comes and goes. Most days it doesn't weigh on me.", deltas: [0, 0, 2, 0, 1] },
      { text: "I don't really think of it as past. It's all happening at once, somehow.", deltas: [2, 2, 0, 0, 0] },
    ],
  },
  {
    prompt: "If the people closest to you described you in one sentence, which would you most expect to hear?",
    options: [
      { text: "That you're hard to read — that they sense more going on than you show.", deltas: [0, 0, -1, 0, -2] },
      { text: "That you notice things other people miss.", deltas: [1, -2, 0, 0, -2] },
      { text: "That you're easy to be around — that you lighten the room.", deltas: [0, 0, 2, 2, 2] },
      { text: "That there's something a little strange about you they can't quite name.", deltas: [2, 2, 0, 0, 0] },
    ],
  },
  {
    prompt: "You're at a gathering where you only know one person. They get pulled into a conversation across the room. You're standing alone with a drink. What happens next?",
    options: [
      { text: "You drift toward the bookshelf, the kitchen, somewhere quieter. Parties aren't really yours.", deltas: [0, 0, 0, -2, -2] },
      { text: "You find someone new to talk to. There's always someone worth knowing if you look.", deltas: [0, 0, 2, 2, 2] },
      { text: "You observe for a while. You can learn a lot about the people around you just by watching.", deltas: [-2, -2, 0, 0, -2] },
      { text: "You stay where you are. People will come or they won't. It isn't really your concern.", deltas: [2, 2, 0, -2, 0] },
    ],
  },
  {
    prompt: "What kind of person tends to draw you in?",
    options: [
      { text: "Someone with a calm intelligence — who thinks before speaking and means what they say.", deltas: [-2, 0, 0, 0, -2] },
      { text: "Someone with their own private world. Who you can sense more than know.", deltas: [2, 2, 0, 0, -2] },
      { text: "Someone warm. Who makes ordinary moments feel like enough.", deltas: [0, 0, 2, 2, 2] },
      { text: "Someone competent. Who's good at what they do and doesn't make a show of it.", deltas: [-2, -2, 0, 0, -2] },
    ],
  },
  {
    prompt: "You're at a station waiting for a train that's running late. Across the platform, a stranger is staring at you. Not aggressively — more like they're trying to place you. What happens in your head?",
    options: [
      { text: "You meet their eyes calmly. If they have something to say, this is the moment.", deltas: [0, -2, 0, 0, 2] },
      { text: "A flicker of recognition you can't explain. Maybe you've met somewhere you don't remember.", deltas: [2, 2, -1, 0, 0] },
      { text: "You start cataloguing them. Age, posture, what they're carrying. Working out what they want.", deltas: [-2, -2, 0, 0, -2] },
      { text: "Nothing in particular. They'll look away when they're done.", deltas: [2, 2, 2, -2, 0] },
    ],
  },
  {
    prompt: "When something hurts you, you're most likely to:",
    options: [
      { text: "Withdraw. You need to be alone with it for a while before you can put words to it.", deltas: [0, 0, -2, -2, -2] },
      { text: "Talk it through with someone you trust, even if it takes you a while to start.", deltas: [0, 0, 0, 2, 2] },
      { text: "Lose yourself in something demanding — work, exercise, a problem that needs solving.", deltas: [0, -2, -1, 0, -2] },
      { text: "Sit with it quietly. Pain passes through, like weather.", deltas: [2, 0, 2, 0, 0] },
    ],
  },
];

// =====================================================================
// SCORING — pure functions, easy to test or swap out
// =====================================================================
const STARTING_VECTOR = [5, 5, 5, 5, 5];
const MAX_DISTANCE = Math.sqrt(5 * 100); // sqrt(500) ≈ 22.36

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

function applyDeltas(vector, deltas) {
  return vector.map((v, i) => clamp(v + deltas[i], 0, 10));
}

function calculateMatches(userVec) {
  return CHARACTERS
    .map((char) => {
      const dist = Math.sqrt(
        char.traits.reduce((sum, t, i) => sum + (t - userVec[i]) ** 2, 0)
      );
      const match = Math.max(0, Math.round(100 * (1 - dist / MAX_DISTANCE)));
      return { ...char, distance: dist, match };
    })
    .sort((a, b) => a.distance - b.distance);
}

// =====================================================================
// PALETTE — warm cream paper, dark ink, ochre & slate accents
// =====================================================================
const C = {
  paper: '#F5F1E8',
  paperDeep: '#EBE4D2',
  ink: '#1A1A1A',
  inkSoft: '#3C3530',
  ochre: '#8B7355',
  slate: '#3B4A5C',
  rule: '#D4C9B8',
};

const FONT = '"Crimson Pro", "EB Garamond", Georgia, "Times New Roman", serif';

// =====================================================================
// COMPONENT
// =====================================================================
export default function MurakamiQuiz() {
  const [stage, setStage] = useState('start'); // 'start' | 'question' | 'result'
  const [qIndex, setQIndex] = useState(0);
  const [userVec, setUserVec] = useState(STARTING_VECTOR);

  // Load Crimson Pro from Google Fonts (idempotent)
  useEffect(() => {
    const id = 'murakami-quiz-font';
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,500;0,600;1,400&display=swap';
    document.head.appendChild(link);
  }, []);

  const handleSelect = (deltas) => {
    setUserVec((prev) => applyDeltas(prev, deltas));
    if (qIndex + 1 >= QUESTIONS.length) {
      setStage('result');
    } else {
      setQIndex(qIndex + 1);
    }
  };

  const restart = () => {
    setStage('start');
    setQIndex(0);
    setUserVec(STARTING_VECTOR);
  };

  return (
    <div
      className="min-h-screen w-full px-6 py-12 md:py-20"
      style={{ fontFamily: FONT, backgroundColor: C.paper, color: C.ink }}
    >
      <div className="max-w-2xl mx-auto">
        {stage === 'start' && <StartScreen onBegin={() => setStage('question')} />}
        {stage === 'question' && (
          <QuestionScreen
            question={QUESTIONS[qIndex]}
            qIndex={qIndex}
            total={QUESTIONS.length}
            onSelect={handleSelect}
          />
        )}
        {stage === 'result' && <ResultScreen userVec={userVec} onRestart={restart} />}
      </div>
    </div>
  );
}

// =====================================================================
// SCREENS
// =====================================================================
function StartScreen({ onBegin }) {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-xs tracking-[0.25em] uppercase" style={{ color: C.ochre }}>
          A character quiz
        </p>
        <h1 className="text-5xl md:text-6xl font-medium leading-tight">
          Which Murakami<br />character are you?
        </h1>
        <p className="text-xl italic" style={{ color: C.inkSoft }}>
          From Kafka on the Shore and 1Q84
        </p>
      </div>

      <p className="text-lg leading-relaxed" style={{ color: C.inkSoft }}>
        Ten questions, four options each. Some are scenarios, some are direct.
        Answer honestly — the kind of person you are, not the kind you'd like
        to be — and at the end you'll be matched to one of eight characters.
      </p>

      <PrimaryButton onClick={onBegin}>Begin</PrimaryButton>
    </div>
  );
}

function QuestionScreen({ question, qIndex, total, onSelect }) {
  const progress = (qIndex / total) * 100;
  return (
    <div className="space-y-10" key={qIndex}>
      <div>
        <div
          className="flex items-center justify-between text-xs tracking-[0.25em] uppercase mb-3"
          style={{ color: C.ochre }}
        >
          <span>Question {qIndex + 1} of {total}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-px w-full" style={{ backgroundColor: C.rule }}>
          <div
            className="h-px transition-all duration-500"
            style={{ width: `${progress}%`, backgroundColor: C.ink }}
          />
        </div>
      </div>

      <p className="text-2xl md:text-3xl leading-relaxed" style={{ color: C.ink }}>
        {question.prompt}
      </p>

      <div className="space-y-3">
        {question.options.map((option, i) => (
          <OptionButton key={i} onClick={() => onSelect(option.deltas)}>
            {option.text}
          </OptionButton>
        ))}
      </div>
    </div>
  );
}

function ResultScreen({ userVec, onRestart }) {
  const matches = calculateMatches(userVec);
  const [primary, secondary, tertiary] = matches;

  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <p className="text-xs tracking-[0.25em] uppercase" style={{ color: C.ochre }}>
          Your match
        </p>
        <h2 className="text-5xl md:text-6xl font-medium leading-tight">
          {primary.name}
        </h2>
        <p className="text-xl italic" style={{ color: C.inkSoft }}>
          {primary.epithet} · {primary.novel}
        </p>
        <p className="text-2xl pt-1" style={{ color: C.slate }}>
          {primary.match}% match
        </p>
      </div>

      <p className="text-lg leading-relaxed" style={{ color: C.inkSoft }}>
        {primary.description}
      </p>

      <div className="pt-6 space-y-4 border-t" style={{ borderColor: C.rule }}>
        <p className="text-xs tracking-[0.25em] uppercase" style={{ color: C.ochre }}>
          With echoes of
        </p>
        <div className="space-y-2">
          <EchoRow name={secondary.name} novel={secondary.novel} match={secondary.match} />
          <EchoRow name={tertiary.name} novel={tertiary.novel} match={tertiary.match} />
        </div>
      </div>

      <div className="pt-6 space-y-6 border-t" style={{ borderColor: C.rule }}>
        <p className="text-xs tracking-[0.25em] uppercase" style={{ color: C.ochre }}>
          Where you landed
        </p>
        <div className="space-y-5">
          {AXES.map((axis, i) => (
            <AxisRow key={i} axis={axis} value={userVec[i]} />
          ))}
        </div>
      </div>

      <SecondaryButton onClick={onRestart}>Take it again</SecondaryButton>
    </div>
  );
}

// =====================================================================
// SHARED COMPONENTS
// =====================================================================
function PrimaryButton({ children, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="text-lg px-8 py-3 transition-colors duration-200"
      style={{
        backgroundColor: hover ? C.slate : C.ink,
        color: C.paper,
        border: 'none',
        fontFamily: FONT,
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
}

function SecondaryButton({ children, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="text-lg px-8 py-3 transition-colors duration-200"
      style={{
        backgroundColor: hover ? C.ink : 'transparent',
        color: hover ? C.paper : C.ink,
        border: `1px solid ${C.ink}`,
        fontFamily: FONT,
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
}

function OptionButton({ children, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="w-full text-left p-5 transition-colors duration-200"
      style={{
        backgroundColor: hover ? C.ink : 'transparent',
        color: hover ? C.paper : C.ink,
        border: `1px solid ${hover ? C.ink : C.rule}`,
        fontFamily: FONT,
        cursor: 'pointer',
      }}
    >
      <span className="text-base md:text-lg leading-relaxed">{children}</span>
    </button>
  );
}

function EchoRow({ name, novel, match }) {
  return (
    <div className="flex justify-between items-baseline gap-4">
      <span className="text-lg">
        {name}
        <span className="italic ml-2" style={{ color: C.inkSoft }}>· {novel}</span>
      </span>
      <span className="text-sm tabular-nums" style={{ color: C.inkSoft }}>{match}%</span>
    </div>
  );
}

function AxisRow({ axis, value }) {
  const percent = (value / 10) * 100;
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm" style={{ color: C.inkSoft }}>
        <span>{axis.left}</span>
        <span>{axis.right}</span>
      </div>
      <div className="relative h-px w-full" style={{ backgroundColor: C.rule }}>
        <div
          className="absolute"
          style={{
            left: `${percent}%`,
            top: '-7px',
            width: '2px',
            height: '15px',
            backgroundColor: C.ink,
            transform: 'translateX(-50%)',
          }}
        />
      </div>
    </div>
  );
}
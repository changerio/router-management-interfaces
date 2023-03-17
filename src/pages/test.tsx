import { atom, PrimitiveAtom, useAtom } from "jotai";

const countsAtom = atom([atom(1), atom(2), atom(3)]);

const Counter = ({ countAtom }: { countAtom: PrimitiveAtom<number> }) => {
  const [count, setCount] = useAtom(countAtom);
  return (
    <div>
      {count} <button onClick={() => setCount((c) => c + 1)}>+1</button>
    </div>
  );
};

const Parent = () => {
  const [counts, setCounts] = useAtom(countsAtom);
  const addNewCount = () => {
    const newAtom = atom(0);
    setCounts((prev) => [...prev, newAtom]);
  };
  return (
    <div>
      {counts.map((countAtom, i) => (
        <Counter countAtom={countAtom} key={i} />
      ))}
      <button onClick={addNewCount}>Add</button>
    </div>
  );
};

export default function Test() {
  return <Parent></Parent>;
}

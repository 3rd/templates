import "./App.css";

const App = () => {
  return (
    <div className="p-4 flex flex-col gap-2">
      <h1 className="text-lg font-semibold">React</h1>
      <ul className="list-inside list-disc">
        <li>Rsbuild</li>
        <li>Tailwind CSS</li>
        <li>@rsbuild/plugin-type-check</li>
        <li>@rsbuild/plugin-image-compress</li>
      </ul>
    </div>
  );
};

export default App;

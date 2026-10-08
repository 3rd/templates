import { useMemo, useState } from "react";

import { Greet } from "../wailsjs/go/main/Greeter";

const appName = "go-gui-wails";
const tabs = ["Home", "Notes", "Settings"] as const;

type Tab = (typeof tabs)[number];

export const App = () => {
  const [tab, setTab] = useState<Tab>("Home");
  const [count, setCount] = useState(0);
  const [note, setNote] = useState("");
  const [notifications, setNotifications] = useState(true);
  const [displayName, setDisplayName] = useState(appName);
  const [savedName, setSavedName] = useState(appName);
  const [greeting, setGreeting] = useState("");

  const status = useMemo(() => {
    if (tab === "Home") return `Home · Count ${count}`;
    if (tab === "Notes") return `Notes · ${Array.from(note).length} characters`;
    return `Settings · Notifications ${notifications ? "on" : "off"}`;
  }, [tab, count, note, notifications]);

  const requestGreeting = async () => {
    setGreeting(await Greet(savedName));
  };

  return (
    <div className="shell">
      <header className="header">
        <div>
          <h1>{appName}</h1>
          <p className="lede">Starter workspace</p>
        </div>
        <span className="badge">starter</span>
      </header>
      <nav className="tabs" role="tablist" aria-label="Workspace">
        {tabs.map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            id={`tab-${item}`}
            aria-controls={`panel-${item}`}
            aria-selected={tab === item}
            tabIndex={tab === item ? 0 : -1}
            onClick={() => setTab(item)}
            onKeyDown={(event) => {
              const direction = event.key === "ArrowRight" ? 1 : -1;

              const isArrowKey =
                event.key === "ArrowRight" || event.key === "ArrowLeft";
              if (!isArrowKey) return;

              const next =
                tabs[
                  (tabs.indexOf(item) + direction + tabs.length) % tabs.length
                ];
              if (next === undefined) return;

              event.preventDefault();
              setTab(next);

              const nextTab = document.getElementById(`tab-${next}`);
              if (!(nextTab instanceof HTMLButtonElement)) {
                throw new Error(`Missing tab button for ${next}`);
              }

              nextTab.focus();
            }}
          >
            {item}
          </button>
        ))}
      </nav>
      <main className="content">
        <section
          role="tabpanel"
          id="panel-Home"
          aria-labelledby="tab-Home"
          hidden={tab !== "Home"}
        >
          <h2>Home</h2>
          <p>
            A desktop shell with tabs, a content pane, and a few working
            controls.
          </p>
          <p>Count: {count}</p>
          <div className="controls">
            <button type="button" onClick={() => setCount(count + 1)}>
              Increment
            </button>
            <button type="button" onClick={() => setCount(0)}>
              Reset
            </button>
            <button type="button" onClick={requestGreeting}>
              Greet from Go
            </button>
          </div>
          {greeting !== "" && <p>{greeting}</p>}
        </section>
        <section
          role="tabpanel"
          id="panel-Notes"
          aria-labelledby="tab-Notes"
          hidden={tab !== "Notes"}
        >
          <h2>Notes</h2>
          <label className="field">
            Note
            <input
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Write a note"
            />
          </label>
          <p>Preview: {note === "" ? "(empty)" : note}</p>
          <div className="controls">
            <button type="button" onClick={() => setNote("")}>
              Clear
            </button>
          </div>
        </section>
        <section
          role="tabpanel"
          id="panel-Settings"
          aria-labelledby="tab-Settings"
          hidden={tab !== "Settings"}
        >
          <h2>Settings</h2>
          <label className="check">
            <input
              type="checkbox"
              checked={notifications}
              onChange={(event) => setNotifications(event.target.checked)}
            />
            Notifications
          </label>
          <label className="field">
            Display name
            <input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
            />
          </label>
          <div className="controls">
            <button type="button" onClick={() => setSavedName(displayName)}>
              Apply
            </button>
          </div>
        </section>
      </main>
      <footer className="status">{status}</footer>
    </div>
  );
};

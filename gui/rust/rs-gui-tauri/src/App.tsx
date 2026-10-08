import { invoke } from "@tauri-apps/api/core";
import { useMemo, useRef, useState } from "react";

const appName = "rs-gui-tauri";
const tabs = ["Home", "Notes", "Settings"] as const;

type Tab = (typeof tabs)[number];

export const App = () => {
  const [tab, setTab] = useState<Tab>("Home");
  const tabButtons = useRef(new Map<Tab, HTMLButtonElement>());

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

  const greet = async () => {
    setGreeting(await invoke<string>("greet", { name: savedName }));
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
      <nav className="tabs" role="tablist">
        {tabs.map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            id={`tab-${item}`}
            aria-controls={`panel-${item}`}
            aria-selected={tab === item}
            tabIndex={tab === item ? 0 : -1}
            ref={(button) => {
              if (button) {
                tabButtons.current.set(item, button);
              } else {
                tabButtons.current.delete(item);
              }
            }}
            onClick={() => setTab(item)}
            onKeyDown={(event) => {
              const index = tabs.indexOf(item);
              let nextTab: Tab | undefined;

              switch (event.key) {
                case "ArrowRight": {
                  nextTab = tabs[(index + 1) % tabs.length];
                  break;
                }
                case "ArrowLeft": {
                  nextTab = tabs[(index + tabs.length - 1) % tabs.length];
                  break;
                }
                case "Home": {
                  nextTab = "Home";
                  break;
                }
                case "End": {
                  nextTab = "Settings";
                  break;
                }
                default: {
                  return;
                }
              }

              if (!nextTab) return;

              event.preventDefault();
              setTab(nextTab);
              tabButtons.current.get(nextTab)?.focus();
            }}
          >
            {item}
          </button>
        ))}
      </nav>
      <main className="content">
        <section id="panel-Home" role="tabpanel" tabIndex={0} aria-labelledby="tab-Home" hidden={tab !== "Home"}>
          <h2>Home</h2>
          <p>A desktop shell with tabs, a content pane, and a few working controls.</p>
          <p>Count: {count}</p>
          <div className="controls">
            <button type="button" onClick={() => setCount(count + 1)}>
              Increment
            </button>
            <button type="button" onClick={() => setCount(0)}>
              Reset
            </button>
            <button type="button" onClick={greet}>
              Greet
            </button>
          </div>
          {greeting !== "" && <p>{greeting}</p>}
        </section>
        <section id="panel-Notes" role="tabpanel" tabIndex={0} aria-labelledby="tab-Notes" hidden={tab !== "Notes"}>
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
        <section id="panel-Settings" role="tabpanel" tabIndex={0} aria-labelledby="tab-Settings" hidden={tab !== "Settings"}>
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

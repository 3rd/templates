#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::collections::HashMap;
use std::rc::Rc;

use dioxus::desktop::{Config, WindowBuilder};
use dioxus::prelude::*;

const APP_NAME: &str = "rs-gui-dioxus";
const STYLES: &str = r#"
:root { color-scheme: light; --bg:#f2f2ee; --surface:#fff; --border:#d6d6cf; --text:#1c1c18; --muted:#5c5c55; --accent:#3d4e8c; --accent-soft:#e6e9f4; --header:#ecece6; --status:#e7e7e1; font: 14px/1.45 "Segoe UI", system-ui, sans-serif; }
* { box-sizing: border-box; }
html, body { height: 100%; min-height: 100%; margin: 0; background: var(--bg); color: var(--text); }
.shell { display: flex; flex-direction: column; height: 100%; min-height: 100%; }
.header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: var(--header); border-bottom: 1px solid var(--border); }
.header h1 { margin: 0; font-size: 18px; }
.lede { margin: 2px 0 0; color: var(--muted); font-size: 12px; }
.badge { border: 1px solid var(--border); background: var(--surface); color: var(--muted); font-size: 11px; letter-spacing: 0.04em; text-transform: uppercase; padding: 3px 8px; }
.tabs { display: flex; gap: 4px; padding: 8px 12px 0; border-bottom: 1px solid var(--border); }
.tabs button { appearance: none; border: 1px solid transparent; border-bottom: none; background: transparent; color: var(--muted); padding: 8px 14px; border-radius: 6px 6px 0 0; cursor: pointer; font: inherit; }
.tabs button[aria-selected="true"] { background: var(--surface); color: var(--text); border-color: var(--border); font-weight: 600; }
.content { flex: 1; overflow: auto; background: var(--surface); padding: 20px 24px; }
.content h2 { margin: 0 0 8px; font-size: 16px; }
.content p { margin: 0 0 12px; }
.controls { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px; }
.content button { appearance: none; border: 1px solid var(--border); background: var(--accent-soft); color: var(--accent); padding: 6px 12px; border-radius: 6px; cursor: pointer; font: inherit; font-weight: 600; }
.field { display: flex; flex-direction: column; gap: 6px; margin: 12px 0; color: var(--muted); font-size: 12px; }
.field input { border: 1px solid var(--border); border-radius: 6px; padding: 8px 10px; font: inherit; color: var(--text); background: var(--bg); }
.check { display: flex; align-items: center; gap: 8px; margin: 12px 0; }
.status { padding: 8px 16px; background: var(--status); border-top: 1px solid var(--border); color: var(--muted); font-size: 12px; }
"#;

#[derive(Clone, Copy, PartialEq, Eq, Hash)]
enum Tab {
    Home,
    Notes,
    Settings,
}

impl Tab {
    const ALL: [Tab; 3] = [Tab::Home, Tab::Notes, Tab::Settings];

    fn label(self) -> &'static str {
        match self {
            Tab::Home => "Home",
            Tab::Notes => "Notes",
            Tab::Settings => "Settings",
        }
    }

    fn slug(self) -> &'static str {
        match self {
            Tab::Home => "home",
            Tab::Notes => "notes",
            Tab::Settings => "settings",
        }
    }

    fn tab_id(self) -> String {
        format!("tab-{}", self.slug())
    }

    fn panel_id(self) -> String {
        format!("panel-{}", self.slug())
    }

    fn next(self) -> Tab {
        match self {
            Tab::Home => Tab::Notes,
            Tab::Notes => Tab::Settings,
            Tab::Settings => Tab::Home,
        }
    }

    fn previous(self) -> Tab {
        match self {
            Tab::Home => Tab::Settings,
            Tab::Notes => Tab::Home,
            Tab::Settings => Tab::Notes,
        }
    }
}

fn main() {
    let window = WindowBuilder::new()
        .with_title(APP_NAME)
        .with_resizable(true);

    dioxus::LaunchBuilder::desktop()
        .with_cfg(Config::new().with_window(window))
        .launch(app)
}

fn app() -> Element {
    let mut tab = use_signal(|| Tab::Home);
    let mut tab_buttons = use_signal(HashMap::<Tab, Rc<MountedData>>::new);
    let mut count = use_signal(|| 0);
    let mut note = use_signal(String::new);
    let mut notifications = use_signal(|| true);
    let mut display_name = use_signal(|| APP_NAME.to_string());
    let mut saved_message = use_signal(String::new);

    let status = match tab() {
        Tab::Home => format!("Home · Count {}", count()),
        Tab::Notes => format!("Notes · {} characters", note().chars().count()),
        Tab::Settings => format!(
            "Settings · Notifications {}",
            if notifications() { "on" } else { "off" }
        ),
    };

    rsx! {
        style { {STYLES} }
        div { class: "shell",
            header { class: "header",
                div {
                    h1 { "{APP_NAME}" }
                    p { class: "lede", "Starter workspace" }
                }
                span { class: "badge", "starter" }
            }
            nav { class: "tabs", role: "tablist", aria_label: "Workspace",
                for item in Tab::ALL {
                    button {
                        r#type: "button",
                        role: "tab",
                        id: item.tab_id(),
                        aria_controls: item.panel_id(),
                        aria_selected: tab() == item,
                        tabindex: if tab() == item { "0" } else { "-1" },
                        onmounted: move |event| {
                            tab_buttons.write().insert(item, event.data());
                        },
                        onclick: move |_| tab.set(item),
                        onkeydown: move |event| {
                            let next = match event.key() {
                                Key::ArrowRight => item.next(),
                                Key::ArrowLeft => item.previous(),
                                Key::Home => Tab::Home,
                                Key::End => Tab::Settings,
                                _ => return,
                            };

                            event.prevent_default();
                            tab.set(next);

                            if let Some(button) = tab_buttons.read().get(&next).cloned() {
                                spawn(async move {
                                    _ = button.set_focus(true).await;
                                });
                            }
                        },
                        {item.label()}
                    }
                }
            }
            main { class: "content",
                section {
                    id: Tab::Home.panel_id(),
                    role: "tabpanel",
                    aria_labelledby: Tab::Home.tab_id(),
                    tabindex: "0",
                    hidden: tab() != Tab::Home,
                    h2 { "Home" }
                    p { "A desktop shell with tabs, a content pane, and a few working controls." }
                    p { "Count: {count}" }
                    div { class: "controls",
                        button { r#type: "button", onclick: move |_| count += 1, "Increment" }
                        button { r#type: "button", onclick: move |_| count.set(0), "Reset" }
                    }
                }
                section {
                    id: Tab::Notes.panel_id(),
                    role: "tabpanel",
                    aria_labelledby: Tab::Notes.tab_id(),
                    tabindex: "0",
                    hidden: tab() != Tab::Notes,
                    h2 { "Notes" }
                    label { class: "field",
                        "Note"
                        input {
                            value: "{note}",
                            placeholder: "Write a note",
                            oninput: move |event| note.set(event.value()),
                        }
                    }
                    p {
                        if note().is_empty() { "Preview: (empty)" } else { "Preview: {note}" }
                    }
                    div { class: "controls",
                        button { r#type: "button", onclick: move |_| note.set(String::new()), "Clear" }
                    }
                }
                section {
                    id: Tab::Settings.panel_id(),
                    role: "tabpanel",
                    aria_labelledby: Tab::Settings.tab_id(),
                    tabindex: "0",
                    hidden: tab() != Tab::Settings,
                    h2 { "Settings" }
                    label { class: "check",
                        input {
                            r#type: "checkbox",
                            checked: notifications(),
                            oninput: move |event| notifications.set(event.checked()),
                        }
                        "Notifications"
                    }
                    label { class: "field",
                        "Display name"
                        input {
                            value: "{display_name}",
                            oninput: move |event| display_name.set(event.value()),
                        }
                    }
                    div { class: "controls",
                        button {
                            r#type: "button",
                            onclick: move |_| saved_message.set(format!("Settings · Saved as {}", display_name())),
                            "Apply"
                        }
                    }
                    p { "{saved_message}" }
                }
            }
            footer { class: "status", "{status}" }
        }
    }
}

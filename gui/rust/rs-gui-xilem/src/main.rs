use xilem::view::{Axis, checkbox, flex, label, text_button, text_input};
use xilem::winit::error::EventLoopError;
use xilem::{EventLoop, WidgetView, WindowOptions, Xilem};

const APP_NAME: &str = "rs-gui-xilem";

#[derive(Clone, Copy, PartialEq, Eq)]
enum Tab {
    Home,
    Notes,
    Settings,
}

struct Workspace {
    tab: Tab,
    count: i32,
    note: String,
    notifications: bool,
    display_name: String,
    saved_name: Option<String>,
}

impl Default for Workspace {
    fn default() -> Self {
        Self {
            tab: Tab::Home,
            count: 0,
            note: String::new(),
            notifications: true,
            display_name: APP_NAME.to_owned(),
            saved_name: None,
        }
    }
}

fn app_logic(state: &mut Workspace) -> impl WidgetView<Workspace> + use<> {
    let header = flex(
        Axis::Vertical,
        (
            label(APP_NAME).text_size(24.0),
            label("Starter workspace"),
            flex(
                Axis::Horizontal,
                (
                    text_button("Home", |state: &mut Workspace| state.tab = Tab::Home),
                    text_button("Notes", |state: &mut Workspace| state.tab = Tab::Notes),
                    text_button("Settings", |state: &mut Workspace| {
                        state.tab = Tab::Settings
                    }),
                ),
            ),
        ),
    );

    let body = match state.tab {
        Tab::Home => flex(
            Axis::Vertical,
            (
                label("Home").text_size(18.0),
                label("A desktop shell with tabs, a content pane, and a few working controls."),
                label(format!("Count: {}", state.count)),
                flex(
                    Axis::Horizontal,
                    (
                        text_button("Increment", |state: &mut Workspace| state.count += 1),
                        text_button("Reset", |state: &mut Workspace| state.count = 0),
                    ),
                ),
            ),
        )
        .boxed(),
        Tab::Notes => flex(
            Axis::Vertical,
            (
                label("Notes").text_size(18.0),
                label("Note"),
                text_input(state.note.clone(), |state: &mut Workspace, value| {
                    state.note = value;
                }),
                label(if state.note.is_empty() {
                    "Preview: (empty)".to_owned()
                } else {
                    format!("Preview: {}", state.note)
                }),
                text_button("Clear", |state: &mut Workspace| state.note.clear()),
            ),
        )
        .boxed(),
        Tab::Settings => flex(
            Axis::Vertical,
            (
                label("Settings").text_size(18.0),
                checkbox(
                    "Notifications",
                    state.notifications,
                    |state: &mut Workspace, value| state.notifications = value,
                ),
                label("Display name"),
                text_input(
                    state.display_name.clone(),
                    |state: &mut Workspace, value| state.display_name = value,
                ),
                text_button("Apply", |state: &mut Workspace| {
                    state.saved_name = Some(state.display_name.clone());
                }),
                label(
                    state
                        .saved_name
                        .as_ref()
                        .map(|name| format!("Saved as {name}"))
                        .unwrap_or_default(),
                ),
            ),
        )
        .boxed(),
    };

    let status = match state.tab {
        Tab::Home => format!("Home · Count {}", state.count),
        Tab::Notes => format!("Notes · {} characters", state.note.chars().count()),
        Tab::Settings => format!(
            "Settings · Notifications {}",
            if state.notifications { "on" } else { "off" }
        ),
    };

    flex(Axis::Vertical, (header, body, label(status)))
}

fn main() -> Result<(), EventLoopError> {
    let app = Xilem::new_simple(
        Workspace::default(),
        app_logic,
        WindowOptions::new(APP_NAME),
    );
    app.run_in(EventLoop::with_user_event())
}

use iced::widget::{button, checkbox, column, container, row, text, text_input};
use iced::{Element, Fill};

const APP_NAME: &str = "rs-gui-iced";

fn main() -> iced::Result {
    iced::application(Workspace::default, update, view)
        .title(APP_NAME)
        .run()
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Default)]
enum Tab {
    #[default]
    Home,
    Notes,
    Settings,
}

struct Workspace {
    tab: Tab,
    count: u64,
    note: String,
    notifications: bool,
    display_name: String,
    status_message: Option<String>,
}

impl Default for Workspace {
    fn default() -> Self {
        Self {
            tab: Tab::Home,
            count: 0,
            note: String::new(),
            notifications: true,
            display_name: APP_NAME.to_owned(),
            status_message: None,
        }
    }
}

#[derive(Debug, Clone)]
enum Message {
    Tab(Tab),
    Increment,
    Reset,
    Note(String),
    Clear,
    Notifications(bool),
    Name(String),
    Apply,
}

fn update(workspace: &mut Workspace, message: Message) {
    workspace.status_message = None;

    match message {
        Message::Tab(tab) => workspace.tab = tab,
        Message::Increment => workspace.count += 1,
        Message::Reset => workspace.count = 0,
        Message::Note(note) => workspace.note = note,
        Message::Clear => workspace.note.clear(),
        Message::Notifications(value) => workspace.notifications = value,
        Message::Name(name) => workspace.display_name = name,
        Message::Apply => {
            workspace.status_message = Some(format!("Settings · Saved as {}", workspace.display_name));
        }
    }
}

fn tab_button(label: &'static str, tab: Tab, current: Tab) -> Element<'static, Message> {
    let button = button(label);
    if current == tab {
        button.into()
    } else {
        button.on_press(Message::Tab(tab)).into()
    }
}

fn view(workspace: &Workspace) -> Element<'_, Message> {
    let header = column![
        text(APP_NAME).size(24),
        text("Starter workspace"),
        row![
            tab_button("Home", Tab::Home, workspace.tab),
            tab_button("Notes", Tab::Notes, workspace.tab),
            tab_button("Settings", Tab::Settings, workspace.tab),
        ]
        .spacing(8),
    ]
    .spacing(6);

    let content = match workspace.tab {
        Tab::Home => column![
            text("Home").size(20),
            text("A desktop shell with tabs, a content pane, and a few working controls."),
            text(format!("Count: {}", workspace.count)),
            row![
                button("Increment").on_press(Message::Increment),
                button("Reset").on_press(Message::Reset),
            ]
            .spacing(8),
        ],
        Tab::Notes => column![
            text("Notes").size(20),
            text("Note"),
            text_input("Write a note", &workspace.note).on_input(Message::Note),
            text(if workspace.note.is_empty() {
                "Preview: (empty)".to_owned()
            } else {
                format!("Preview: {}", workspace.note)
            }),
            button("Clear").on_press(Message::Clear),
        ],
        Tab::Settings => column![
            text("Settings").size(20),
            checkbox(workspace.notifications)
                .label("Notifications")
                .on_toggle(Message::Notifications),
            text("Display name"),
            text_input("Display name", &workspace.display_name).on_input(Message::Name),
            button("Apply").on_press(Message::Apply),
        ],
    }
    .spacing(10);

    let status = match workspace.tab {
        Tab::Home => format!("Home · Count {}", workspace.count),
        Tab::Notes => format!("Notes · {} characters", workspace.note.chars().count()),
        Tab::Settings => format!(
            "Settings · Notifications {}",
            if workspace.notifications { "on" } else { "off" }
        ),
    };

    column![
        header,
        container(content).padding(16).width(Fill).height(Fill),
        text(workspace.status_message.clone().unwrap_or(status)),
    ]
    .spacing(10)
    .padding(16)
    .into()
}

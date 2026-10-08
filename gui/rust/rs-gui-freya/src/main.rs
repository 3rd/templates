#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use freya::prelude::*;

fn main() {
    launch(
        LaunchConfig::new().with_window(
            WindowConfig::new(app)
                .with_title("rs-gui-freya"),
        ),
    )
}

fn app() -> impl IntoElement {
    let mut tab = use_state(|| 0);
    let count = use_state(|| 0);
    let note = use_state(String::new);
    let notifications = use_state(|| true);
    let display_name = use_state(|| "rs-gui-freya".to_string());
    let saved_message = use_state(String::new);

    let status = match *tab.read() {
        1 => format!("Notes · {} characters", note.read().chars().count()),
        2 => format!(
            "Settings · Notifications {}",
            if *notifications.read() { "on" } else { "off" }
        ),
        _ => format!("Home · Count {}", count.read()),
    };

    rect()
        .width(Size::fill())
        .height(Size::fill())
        .background((242, 242, 238))
        .color((28, 28, 24))
        .direction(Direction::Vertical)
        .child(
            rect()
                .width(Size::fill())
                .direction(Direction::Horizontal)
                .padding(Gaps::new_all(12.0))
                .background((236, 236, 230))
                .child(
                    rect()
                        .direction(Direction::Vertical)
                        .child(rect().font_size(18.0).child("rs-gui-freya"))
                        .child(rect().font_size(12.0).child("Starter workspace")),
                )
                .child(rect().font_size(12.0).child("starter")),
        )
        .child(
            rect()
                .direction(Direction::Horizontal)
                .padding(Gaps::new(8.0, 12.0, 8.0, 12.0))
                .spacing(8.0)
                .child(
                    Button::new()
                        .on_press(move |_| tab.set(0))
                        .child("Home"),
                )
                .child(
                    Button::new()
                        .on_press(move |_| tab.set(1))
                        .child("Notes"),
                )
                .child(
                    Button::new()
                        .on_press(move |_| tab.set(2))
                        .child("Settings"),
                ),
        )
        .child(
            rect()
                .width(Size::fill())
                .height(Size::fill())
                .padding(Gaps::new_all(16.0))
                .background((255, 255, 255))
                .spacing(10.0)
                .child(tab_body(
                    *tab.read(),
                    count,
                    note,
                    notifications,
                    display_name,
                    saved_message,
                )),
        )
        .child(
            rect()
                .width(Size::fill())
                .padding(Gaps::new_all(12.0))
                .background((231, 231, 225))
                .child(status),
        )
}

fn tab_body(
    tab: i32,
    mut count: State<i32>,
    mut note: State<String>,
    mut notifications: State<bool>,
    display_name: State<String>,
    mut saved_message: State<String>,
) -> impl IntoElement {
    match tab {
        1 => rect()
            .direction(Direction::Vertical)
            .spacing(10.0)
            .child(rect().font_size(16.0).child("Notes"))
            .child("Note")
            .child(Input::new(note))
            .child(if note.read().is_empty() {
                "Preview: (empty)".to_owned()
            } else {
                format!("Preview: {}", note.read())
            })
            .child(
                Button::new()
                    .on_press(move |_| note.set(String::new()))
                    .child("Clear"),
            ),
        2 => rect()
            .direction(Direction::Vertical)
            .spacing(10.0)
            .child(rect().font_size(16.0).child("Settings"))
            .child(
                Tile::new()
                    .on_select(move |_| notifications.toggle())
                    .child(Checkbox::new().selected(*notifications.read()))
                    .child("Notifications"),
            )
            .child("Display name")
            .child(Input::new(display_name))
            .child(
                Button::new()
                    .on_press(move |_| {
                        saved_message.set(format!("Settings · Saved as {}", display_name.read()));
                    })
                    .child("Apply"),
            )
            .child(saved_message.read().to_string()),
        _ => rect()
            .direction(Direction::Vertical)
            .spacing(10.0)
            .child(rect().font_size(16.0).child("Home"))
            .child("A desktop shell with tabs, a content pane, and a few working controls.")
            .child(format!("Count: {}", count.read()))
            .child(
                rect()
                    .direction(Direction::Horizontal)
                    .spacing(8.0)
                    .child(
                        Button::new()
                            .on_press(move |_| *count.write() += 1)
                            .child("Increment"),
                    )
                    .child(
                        Button::new()
                            .on_press(move |_| count.set(0))
                            .child("Reset"),
                    ),
            ),
    }
}

use floem::prelude::*;
use floem::window::WindowConfig;
use floem::Application;

const APP_NAME: &str = "rs-gui-floem";

#[derive(Clone, Copy, PartialEq, Eq)]
enum Tab {
    Home,
    Notes,
    Settings,
}

fn workspace_view() -> impl IntoView {
    let tab = RwSignal::new(Tab::Home);
    let count = RwSignal::new(0);
    let note = RwSignal::new(String::new());
    let notifications = RwSignal::new(true);
    let display_name = RwSignal::new(APP_NAME.to_string());
    let saved_message = RwSignal::new(String::new());

    let header = h_stack((
        v_stack((
            text(APP_NAME).style(|s| s.font_size(20.0)),
            text("Starter workspace"),
        )),
        text("starter"),
    ))
    .style(|s| s.width_full().justify_between().items_center().padding(12));

    let tabs = h_stack((
        button("Home").action(move || tab.set(Tab::Home)),
        button("Notes").action(move || tab.set(Tab::Notes)),
        button("Settings").action(move || tab.set(Tab::Settings)),
    ))
    .style(|s| s.gap(8).padding_horiz(12));

    let content = dyn_container(
        move || tab.get(),
        move |current| match current {
            Tab::Home => v_stack((
                text("Home").style(|s| s.font_size(16.0)),
                text("A desktop shell with tabs, a content pane, and a few working controls."),
                label(move || format!("Count: {}", count.get())),
                h_stack((
                    button("Increment").action(move || count.update(|value| *value += 1)),
                    button("Reset").action(move || count.set(0)),
                ))
                .style(|s| s.gap(8)),
            ))
            .style(|s| s.gap(10))
            .into_any(),
            Tab::Notes => v_stack((
                text("Notes").style(|s| s.font_size(16.0)),
                text("Note"),
                text_input(note).placeholder("Write a note"),
                label(move || {
                    let value = note.get();
                    if value.is_empty() {
                        "Preview: (empty)".to_owned()
                    } else {
                        format!("Preview: {value}")
                    }
                }),
                button("Clear").action(move || note.set(String::new())),
            ))
            .style(|s| s.gap(10))
            .into_any(),
            Tab::Settings => v_stack((
                text("Settings").style(|s| s.font_size(16.0)),
                Checkbox::labeled_rw(notifications, || "Notifications"),
                text("Display name"),
                text_input(display_name),
                button("Apply").action(move || {
                    saved_message.set(format!("Settings · Saved as {}", display_name.get()));
                }),
                label(move || saved_message.get()),
            ))
            .style(|s| s.gap(10))
            .into_any(),
        },
    )
    .style(|s| s.padding(16).size_full());

    let status = label(move || match tab.get() {
        Tab::Home => format!("Home · Count {}", count.get()),
        Tab::Notes => format!("Notes · {} characters", note.get().chars().count()),
        Tab::Settings => format!(
            "Settings · Notifications {}",
            if notifications.get() { "on" } else { "off" }
        ),
    })
    .style(|s| s.padding(12));

    v_stack((header, tabs, content, status)).style(|s| s.size_full())
}

fn main() {
    Application::new()
        .window(
            |_window_id| workspace_view(),
            Some(WindowConfig::default().title(APP_NAME)),
        )
        .run();
}

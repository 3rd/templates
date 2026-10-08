use gpui::{
    App, Application, Context, FocusHandle, KeyDownEvent, SharedString, TitlebarOptions, Window,
    WindowOptions, div, prelude::*, rgb,
};

const APP_NAME: &str = "rs-gui-zed-gpui";

#[derive(Clone, Copy, PartialEq, Eq)]
enum Tab {
    Home,
    Settings,
}

struct Workspace {
    focus_handle: FocusHandle,
    tab: Tab,
    count: u32,
    notifications: bool,
}

impl Workspace {
    fn format_status(&self) -> String {
        match self.tab {
            Tab::Home => format!("Home · Count {}", self.count),
            Tab::Settings => format!(
                "Settings · Notifications {}",
                if self.notifications { "on" } else { "off" }
            ),
        }
    }
}

fn tab_button(
    id: &'static str,
    label: &'static str,
    is_selected: bool,
    tab: Tab,
    cx: &mut Context<Workspace>,
) -> impl IntoElement {
    div()
        .id(id)
        .px_3()
        .py_1()
        .rounded_md()
        .bg(if is_selected {
            rgb(0xe6e9f4)
        } else {
            rgb(0xecece6)
        })
        .cursor_pointer()
        .tab_index(0)
        .focus(|style| style.border_2().border_color(rgb(0x3d4e8c)))
        .child(label)
        .on_click(cx.listener(move |workspace, _event, _window, cx| {
            workspace.tab = tab;
            cx.notify();
        }))
}

fn action_button(
    id: &'static str,
    label: &'static str,
    cx: &mut Context<Workspace>,
    on_click: fn(&mut Workspace, &mut Context<Workspace>),
) -> impl IntoElement {
    div()
        .id(id)
        .px_3()
        .py_1()
        .rounded_md()
        .bg(rgb(0xe6e9f4))
        .text_color(rgb(0x3d4e8c))
        .cursor_pointer()
        .tab_index(0)
        .focus(|style| style.border_2().border_color(rgb(0x3d4e8c)))
        .child(label)
        .on_click(cx.listener(move |workspace, _event, _window, cx| {
            on_click(workspace, cx);
            cx.notify();
        }))
}

impl Render for Workspace {
    fn render(&mut self, _window: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        let content = match self.tab {
            Tab::Home => div()
                .flex()
                .flex_col()
                .gap_3()
                .child(div().text_lg().child("Home"))
                .child("A desktop shell with tabs, a content pane, and a few working controls.")
                .child(format!("Count: {}", self.count))
                .child(
                    div()
                        .flex()
                        .gap_2()
                        .child(action_button(
                            "increment",
                            "Increment",
                            cx,
                            |workspace, _| {
                                workspace.count += 1;
                            },
                        ))
                        .child(action_button("reset", "Reset", cx, |workspace, _| {
                            workspace.count = 0;
                        })),
                )
                .into_any_element(),
            Tab::Settings => div()
                .flex()
                .flex_col()
                .gap_3()
                .child(div().text_lg().child("Settings"))
                .child(action_button(
                    "notifications",
                    if self.notifications {
                        "[x] Notifications"
                    } else {
                        "[ ] Notifications"
                    },
                    cx,
                    |workspace, _| workspace.notifications = !workspace.notifications,
                ))
                .into_any_element(),
        };

        div()
            .flex()
            .flex_col()
            .size_full()
            .track_focus(&self.focus_handle)
            .tab_group()
            .tab_stop(false)
            .on_key_down(|event: &KeyDownEvent, window, cx| {
                if event.keystroke.key == "tab" {
                    if event.keystroke.modifiers.shift {
                        window.focus_prev();
                    } else {
                        window.focus_next();
                    }

                    cx.stop_propagation();
                }
            })
            .bg(rgb(0xf2f2ee))
            .text_color(rgb(0x1c1c18))
            .child(
                div()
                    .flex()
                    .justify_between()
                    .items_center()
                    .px_4()
                    .py_3()
                    .bg(rgb(0xecece6))
                    .child(
                        div()
                            .flex()
                            .flex_col()
                            .child(div().text_lg().child(APP_NAME))
                            .child("Starter workspace"),
                    )
                    .child("starter"),
            )
            .child(
                div()
                    .flex()
                    .gap_2()
                    .px_3()
                    .py_2()
                    .child(tab_button(
                        "tab-home",
                        "Home",
                        self.tab == Tab::Home,
                        Tab::Home,
                        cx,
                    ))
                    .child(tab_button(
                        "tab-settings",
                        "Settings",
                        self.tab == Tab::Settings,
                        Tab::Settings,
                        cx,
                    )),
            )
            .child(
                div()
                    .flex_1()
                    .px_6()
                    .py_4()
                    .bg(rgb(0xffffff))
                    .child(content),
            )
            .child(
                div()
                    .px_4()
                    .py_2()
                    .bg(rgb(0xe7e7e1))
                    .text_color(rgb(0x5c5c55))
                    .child(self.format_status()),
            )
    }
}

fn main() {
    Application::new().run(|cx: &mut App| {
        cx.open_window(
            WindowOptions {
                titlebar: Some(TitlebarOptions {
                    title: Some(SharedString::new_static(APP_NAME)),
                    ..Default::default()
                }),
                app_id: Some(APP_NAME.to_string()),
                ..Default::default()
            },
            |window, cx| {
                let workspace = cx.new(|cx| Workspace {
                    focus_handle: cx.focus_handle(),
                    tab: Tab::Home,
                    count: 0,
                    notifications: true,
                });

                window.focus(&workspace.read(cx).focus_handle);
                workspace
            },
        )
        .expect("failed to open window");
        cx.activate(true);
    });
}

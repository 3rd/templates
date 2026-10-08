use makepad_widgets::*;

live_design! {
    use link::theme::*;
    use link::widgets::*;

    App = {{App}} {
        ui: <Root> {
            main_window = <Window> {
                window: {
                    title: "rs-gui-makepad"
                },
                body = <View> {
                    flow: Down,
                    spacing: 8,

                    <View> {
                        flow: Right,
                        padding: 12,
                        spacing: 12,
                        align: { x: 0.0, y: 0.5 }

                        <View> {
                            flow: Down,
                            spacing: 2,
                            <Label> {
                                text: "rs-gui-makepad",
                                draw_text: { text_style: { font_size: 16 } }
                            }
                            <Label> { text: "Starter workspace" }
                        }
                        <View> { width: Fill }
                        <Label> { text: "starter" }
                    }

                    <View> {
                        flow: Right,
                        spacing: 8,
                        padding: { left: 12, right: 12 }
                        home_tab = <Button> { text: "Home" }
                        notes_tab = <Button> { text: "Notes" }
                        settings_tab = <Button> { text: "Settings" }
                    }

                    home_view = <View> {
                        flow: Down,
                        spacing: 10,
                        padding: 16,
                        height: Fill,
                        <Label> { text: "Home", draw_text: { text_style: { font_size: 16 } } }
                        <Label> { text: "A desktop shell with tabs, a content pane, and a few working controls." }
                        counter_label = <Label> { text: "Count: 0" }
                        <View> {
                            flow: Right,
                            spacing: 8,
                            increment_button = <Button> { text: "Increment" }
                            reset_button = <Button> { text: "Reset" }
                        }
                    }

                    notes_view = <View> {
                        flow: Down,
                        spacing: 10,
                        padding: 16,
                        height: Fill,
                        visible: false,
                        <Label> { text: "Notes", draw_text: { text_style: { font_size: 16 } } }
                        <Label> { text: "Note" }
                        note_input = <TextInput> { empty_text: "Write a note" }
                        preview_label = <Label> { text: "Preview: (empty)" }
                        clear_button = <Button> { text: "Clear" }
                    }

                    settings_view = <View> {
                        flow: Down,
                        spacing: 10,
                        padding: 16,
                        height: Fill,
                        visible: false,
                        <Label> { text: "Settings", draw_text: { text_style: { font_size: 16 } } }
                        notifications = <CheckBox> { text: "Notifications" }
                        <Label> { text: "Display name" }
                        name_input = <TextInput> { text: "rs-gui-makepad" }
                        apply_button = <Button> { text: "Apply" }
                    }

                    status_label = <Label> {
                        text: "Home · Count 0",
                        padding: 12
                    }
                }
            }
        }
    }
}

app_main!(App);

#[derive(Live, LiveHook)]
pub struct App {
    #[live]
    ui: WidgetRef,
    #[rust]
    count: usize,
    #[rust]
    note: String,
    #[rust]
    notifications: bool,
}

impl LiveRegister for App {
    fn live_register(cx: &mut Cx) {
        makepad_widgets::live_design(cx);
    }
}

impl App {
    fn show_tab(&mut self, cx: &mut Cx, tab: usize) {
        self.ui.view(id!(home_view)).set_visible(cx, tab == 0);
        self.ui.view(id!(notes_view)).set_visible(cx, tab == 1);
        self.ui.view(id!(settings_view)).set_visible(cx, tab == 2);
        self.refresh_status(cx, tab);
    }

    fn refresh_status(&mut self, cx: &mut Cx, tab: usize) {
        let text = match tab {
            1 => format!("Notes · {} characters", self.note.chars().count()),
            2 => format!(
                "Settings · Notifications {}",
                if self.notifications { "on" } else { "off" }
            ),
            _ => format!("Home · Count {}", self.count),
        };
        self.ui.label(id!(status_label)).set_text(cx, &text);
    }
}

impl MatchEvent for App {
    fn handle_actions(&mut self, cx: &mut Cx, actions: &Actions) {
        if self.ui.button(id!(home_tab)).clicked(actions) {
            self.show_tab(cx, 0);
        }
        if self.ui.button(id!(notes_tab)).clicked(actions) {
            self.show_tab(cx, 1);
        }
        if self.ui.button(id!(settings_tab)).clicked(actions) {
            self.show_tab(cx, 2);
        }
        if self.ui.button(id!(increment_button)).clicked(actions) {
            self.count += 1;
            self.ui
                .label(id!(counter_label))
                .set_text(cx, &format!("Count: {}", self.count));
            self.refresh_status(cx, 0);
        }
        if self.ui.button(id!(reset_button)).clicked(actions) {
            self.count = 0;
            self.ui.label(id!(counter_label)).set_text(cx, "Count: 0");
            self.refresh_status(cx, 0);
        }
        if let Some(text) = self.ui.text_input(id!(note_input)).changed(actions) {
            self.note = text.clone();
            let preview = if text.is_empty() {
                "Preview: (empty)".to_owned()
            } else {
                format!("Preview: {text}")
            };
            self.ui.label(id!(preview_label)).set_text(cx, &preview);
            self.refresh_status(cx, 1);
        }
        if self.ui.button(id!(clear_button)).clicked(actions) {
            self.note.clear();
            self.ui.text_input(id!(note_input)).set_text(cx, "");
            self.ui
                .label(id!(preview_label))
                .set_text(cx, "Preview: (empty)");
            self.refresh_status(cx, 1);
        }
        if let Some(value) = self.ui.check_box(id!(notifications)).changed(actions) {
            self.notifications = value;
            self.refresh_status(cx, 2);
        }

        if self.ui.button(id!(apply_button)).clicked(actions) {
            let name = self.ui.text_input(id!(name_input)).text();
            self.ui
                .label(id!(status_label))
                .set_text(cx, &format!("Settings · Saved as {name}"));
        }
    }
}

impl AppMain for App {
    fn handle_event(&mut self, cx: &mut Cx, event: &Event) {
        self.match_event(cx, event);
        self.ui.handle_event(cx, event, &mut Scope::empty());
    }
}

fn main() {
    app_main();
}

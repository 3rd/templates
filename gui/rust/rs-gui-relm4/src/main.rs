use relm4::gtk;
use relm4::gtk::prelude::*;
use relm4::prelude::*;

const APP_ID: &str = "org.example.RsGuiRelm4";
const APP_NAME: &str = "rs-gui-relm4";

fn counter_text(count: u32) -> String {
    format!("Count: {count}")
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum Tab {
    Home,
    Notes,
    Settings,
}

struct AppModel {
    tab: Tab,
    count: u32,
    note: String,
    notifications: bool,
    display_name: String,
    status_message: Option<String>,
}

impl AppModel {
    fn status(&self) -> String {
        if let Some(message) = &self.status_message {
            return message.clone();
        }

        match self.tab {
            Tab::Home => format!("Home · Count {}", self.count),
            Tab::Notes => format!("Notes · {} characters", self.note.chars().count()),
            Tab::Settings => format!(
                "Settings · Notifications {}",
                if self.notifications { "on" } else { "off" }
            ),
        }
    }
}

#[derive(Debug)]
enum AppMsg {
    Tab(Tab),
    Increment,
    Reset,
    Note(String),
    Clear,
    Notifications(bool),
    Name(String),
    Apply,
}

#[relm4::component]
impl SimpleComponent for AppModel {
    type Init = u32;
    type Input = AppMsg;
    type Output = ();

    view! {
        gtk::Window {
            set_title: Some(APP_NAME),
            set_resizable: true,

            gtk::Box {
                set_orientation: gtk::Orientation::Vertical,
                set_spacing: 8,

                gtk::Box {
                    set_orientation: gtk::Orientation::Horizontal,
                    set_spacing: 12,
                    set_margin_start: 16,
                    set_margin_end: 16,
                    set_margin_top: 12,

                    gtk::Box {
                        set_orientation: gtk::Orientation::Vertical,
                        set_spacing: 2,

                        gtk::Label {
                            set_label: APP_NAME,
                            add_css_class: "title-2",
                        },
                        gtk::Label {
                            set_label: "Starter workspace",
                            add_css_class: "dim-label",
                        },
                    },
                    gtk::Label { set_label: "starter" },
                },

                gtk::Box {
                    set_orientation: gtk::Orientation::Horizontal,
                    set_spacing: 4,
                    set_margin_start: 12,

                    gtk::Button {
                        set_label: "Home",
                        connect_clicked => AppMsg::Tab(Tab::Home),
                    },
                    gtk::Button {
                        set_label: "Notes",
                        connect_clicked => AppMsg::Tab(Tab::Notes),
                    },
                    gtk::Button {
                        set_label: "Settings",
                        connect_clicked => AppMsg::Tab(Tab::Settings),
                    },
                },

                gtk::Box {
                    set_orientation: gtk::Orientation::Vertical,
                    set_spacing: 12,
                    set_margin_start: 16,
                    set_margin_end: 16,
                    set_margin_top: 8,
                    set_vexpand: true,
                    #[watch]
                    set_visible: model.tab == Tab::Home,

                    gtk::Label { set_label: "Home", set_halign: gtk::Align::Start },
                    gtk::Label {
                        set_label: "A desktop shell with tabs, a content pane, and a few working controls.",
                        set_wrap: true,
                    },
                    gtk::Label {
                        set_widget_name: "count",
                        #[watch]
                        set_label: &counter_text(model.count),
                    },
                    gtk::Box {
                        set_orientation: gtk::Orientation::Horizontal,
                        set_spacing: 8,

                        gtk::Button {
                            set_label: "Increment",
                            set_widget_name: "increment",
                            connect_clicked => AppMsg::Increment,
                        },
                        gtk::Button {
                            set_label: "Reset",
                            connect_clicked => AppMsg::Reset,
                        },
                    },
                },

                gtk::Box {
                    set_orientation: gtk::Orientation::Vertical,
                    set_spacing: 12,
                    set_margin_start: 16,
                    set_margin_end: 16,
                    set_margin_top: 8,
                    set_vexpand: true,
                    #[watch]
                    set_visible: model.tab == Tab::Notes,

                    gtk::Label { set_label: "Notes", set_halign: gtk::Align::Start },
                    gtk::Label { set_label: "Note", set_halign: gtk::Align::Start },
                    #[name = "note_entry"]
                    gtk::Entry {
                        set_widget_name: "note",
                        set_placeholder_text: Some("Write a note"),
                        connect_changed[sender] => move |entry| {
                            sender.input(AppMsg::Note(entry.text().to_string()));
                        },
                    },
                    gtk::Label {
                        set_halign: gtk::Align::Start,
                        #[watch]
                        set_label: &if model.note.is_empty() {
                            "Preview: (empty)".to_owned()
                        } else {
                            format!("Preview: {}", model.note)
                        },
                    },
                    gtk::Button {
                        set_label: "Clear",
                        set_halign: gtk::Align::Start,
                        connect_clicked[sender, note_entry] => move |_| {
                            note_entry.set_text("");
                            sender.input(AppMsg::Clear);
                        },
                    },
                },

                gtk::Box {
                    set_orientation: gtk::Orientation::Vertical,
                    set_spacing: 12,
                    set_margin_start: 16,
                    set_margin_end: 16,
                    set_margin_top: 8,
                    set_vexpand: true,
                    #[watch]
                    set_visible: model.tab == Tab::Settings,

                    gtk::Label { set_label: "Settings", set_halign: gtk::Align::Start },
                    gtk::CheckButton {
                        set_label: Some("Notifications"),
                        set_active: true,
                        connect_toggled[sender] => move |button| {
                            sender.input(AppMsg::Notifications(button.is_active()));
                        },
                    },
                    gtk::Label { set_label: "Display name", set_halign: gtk::Align::Start },
                    gtk::Entry {
                        set_widget_name: "display-name",
                        set_text: APP_NAME,
                        connect_changed[sender] => move |entry| {
                            sender.input(AppMsg::Name(entry.text().to_string()));
                        },
                    },
                    gtk::Button {
                        set_label: "Apply",
                        set_widget_name: "apply",
                        set_halign: gtk::Align::Start,
                        connect_clicked => AppMsg::Apply,
                    },
                },

                gtk::Label {
                    set_widget_name: "status",
                    set_halign: gtk::Align::Start,
                    set_margin_start: 16,
                    set_margin_bottom: 8,
                    #[watch]
                    set_label: &model.status(),
                },
            },
        }
    }

    fn init(
        count: Self::Init,
        root: Self::Root,
        sender: ComponentSender<Self>,
    ) -> ComponentParts<Self> {
        let model = AppModel {
            tab: Tab::Home,
            count,
            note: String::new(),
            notifications: true,
            display_name: APP_NAME.to_owned(),
            status_message: None,
        };
        let widgets = view_output!();

        ComponentParts { model, widgets }
    }

    fn update(&mut self, message: Self::Input, _sender: ComponentSender<Self>) {
        self.status_message = None;

        match message {
            AppMsg::Tab(tab) => self.tab = tab,
            AppMsg::Increment => self.count += 1,
            AppMsg::Reset => self.count = 0,
            AppMsg::Note(note) => self.note = note,
            AppMsg::Clear => self.note.clear(),
            AppMsg::Notifications(value) => self.notifications = value,
            AppMsg::Name(name) => self.display_name = name,
            AppMsg::Apply => {
                self.status_message = Some(format!("Settings · Saved as {}", self.display_name));
            }
        }
    }
}

fn main() {
    RelmApp::new(APP_ID).run::<AppModel>(0);
}

#[cfg(test)]
mod tests {
    use super::{AppModel, counter_text};
    use relm4::gtk;
    use relm4::gtk::prelude::*;
    use relm4::prelude::*;

    fn run_pending_events() {
        let context = gtk::glib::MainContext::default();
        while context.pending() {
            context.iteration(true);
        }
    }

    fn find_named(root: &impl IsA<gtk::Widget>, name: &str) -> Option<gtk::Widget> {
        if root.widget_name() == name {
            return Some(root.clone().upcast());
        }
        let mut child = root.first_child();
        while let Some(widget) = child {
            if let Some(found) = find_named(&widget, name) {
                return Some(found);
            }
            child = widget.next_sibling();
        }
        None
    }

    #[test]
    fn counter_text_shows_the_current_count() {
        assert_eq!(counter_text(0), "Count: 0");
        assert_eq!(counter_text(7), "Count: 7");
    }

    #[test]
    fn updating_controls_shows_the_count_saved_name_and_unicode_note_length() {
        gtk::init().expect("these widget tests need a display; run them under xvfb-run");

        let component = AppModel::builder().launch(0).detach();
        let root = component.widget();
        let counter_label = find_named(root, "count")
            .and_then(|widget| widget.downcast::<gtk::Label>().ok())
            .expect("the counter label is named count");
        let button = find_named(root, "increment")
            .and_then(|widget| widget.downcast::<gtk::Button>().ok())
            .expect("the increment button is named increment");

        assert_eq!(counter_label.label(), "Count: 0");

        button.emit_clicked();
        run_pending_events();
        assert_eq!(counter_label.label(), "Count: 1");

        button.emit_clicked();
        run_pending_events();
        assert_eq!(counter_label.label(), "Count: 2");

        let display_name = find_named(root, "display-name")
            .and_then(|widget| widget.downcast::<gtk::Entry>().ok())
            .expect("the display name entry is named display-name");
        let apply = find_named(root, "apply")
            .and_then(|widget| widget.downcast::<gtk::Button>().ok())
            .expect("the Apply button is named apply");
        let status = find_named(root, "status")
            .and_then(|widget| widget.downcast::<gtk::Label>().ok())
            .expect("the status label is named status");

        component
            .sender()
            .emit(super::AppMsg::Tab(super::Tab::Settings));
        display_name.set_text("Maple");
        apply.emit_clicked();
        run_pending_events();
        assert_eq!(status.label(), "Settings · Saved as Maple");

        display_name.set_text("Birch");
        apply.emit_clicked();
        run_pending_events();
        assert_eq!(status.label(), "Settings · Saved as Birch");

        component.sender().emit(super::AppMsg::Tab(super::Tab::Home));
        run_pending_events();
        assert_eq!(status.label(), "Home · Count 2");

        let note = find_named(root, "note")
            .and_then(|widget| widget.downcast::<gtk::Entry>().ok())
            .expect("the note entry is named note");
        component.sender().emit(super::AppMsg::Tab(super::Tab::Notes));

        for (text, count) in [("é", 1), ("😀", 1), ("e\u{301}", 2), ("é😀", 2), ("", 0)] {
            note.set_text(text);
            run_pending_events();
            assert_eq!(status.label(), format!("Notes · {count} characters"));
        }
    }
}

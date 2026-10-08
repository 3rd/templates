use std::cell::Cell;
use std::rc::Rc;

use gtk4::prelude::*;
use gtk4::{
    Align, Application, ApplicationWindow, Box, Button, CheckButton, Entry, Label, Notebook,
    Orientation,
};

const APP_ID: &str = "org.example.RsGuiGtk4";
const APP_NAME: &str = "rs-gui-gtk4";

fn counter_text(count: u32) -> String {
    format!("Count: {count}")
}

fn status_text(tab: u32, count: u32, note_len: usize, notifications: bool) -> String {
    match tab {
        1 => format!("Notes · {note_len} characters"),
        2 => format!(
            "Settings · Notifications {}",
            if notifications { "on" } else { "off" }
        ),
        _ => format!("Home · Count {count}"),
    }
}

fn build_content() -> Box {
    let count = Rc::new(Cell::new(0u32));
    let notifications = Rc::new(Cell::new(true));
    let tab = Rc::new(Cell::new(0u32));
    let note_len = Rc::new(Cell::new(0usize));

    let heading = Label::new(Some(APP_NAME));
    heading.add_css_class("title-2");
    let lede = Label::new(Some("Starter workspace"));
    lede.add_css_class("dim-label");
    let badge = Label::new(Some("starter"));

    let header = Box::new(Orientation::Horizontal, 12);
    header.set_margin_start(16);
    header.set_margin_end(16);
    header.set_margin_top(12);
    let titles = Box::new(Orientation::Vertical, 2);
    titles.append(&heading);
    titles.append(&lede);
    header.append(&titles);
    header.append(&badge);

    let counter_label = Label::new(Some(&counter_text(0)));
    counter_label.set_widget_name("count");
    let status = Label::new(Some(&status_text(0, 0, 0, true)));
    status.set_widget_name("status");
    status.set_halign(Align::Start);
    status.set_margin_start(16);
    status.set_margin_end(16);
    status.set_margin_bottom(8);

    let increment = Button::with_label("Increment");
    increment.set_widget_name("increment");
    increment.connect_clicked({
        let counter_label = counter_label.clone();
        let status = status.clone();
        let count = Rc::clone(&count);
        let tab = Rc::clone(&tab);
        let note_len = Rc::clone(&note_len);
        let notifications = Rc::clone(&notifications);
        move |_| {
            count.set(count.get() + 1);
            counter_label.set_label(&counter_text(count.get()));
            status.set_label(&status_text(
                tab.get(),
                count.get(),
                note_len.get(),
                notifications.get(),
            ));
        }
    });

    let reset = Button::with_label("Reset");
    reset.connect_clicked({
        let counter_label = counter_label.clone();
        let status = status.clone();
        let count = Rc::clone(&count);
        let tab = Rc::clone(&tab);
        let note_len = Rc::clone(&note_len);
        let notifications = Rc::clone(&notifications);
        move |_| {
            count.set(0);
            counter_label.set_label(&counter_text(0));
            status.set_label(&status_text(
                tab.get(),
                0,
                note_len.get(),
                notifications.get(),
            ));
        }
    });

    let home_buttons = Box::new(Orientation::Horizontal, 8);
    home_buttons.append(&increment);
    home_buttons.append(&reset);

    let home = Box::new(Orientation::Vertical, 12);
    home.set_margin_start(16);
    home.set_margin_end(16);
    home.set_margin_top(16);
    home.append(&Label::new(Some("Home")));
    home.append(&Label::new(Some(
        "A desktop shell with tabs, a content pane, and a few working controls.",
    )));
    home.append(&counter_label);
    home.append(&home_buttons);

    let note = Entry::new();
    note.set_widget_name("note");
    note.set_placeholder_text(Some("Write a note"));
    let preview = Label::new(Some("Preview: (empty)"));
    preview.set_halign(Align::Start);
    note.connect_changed({
        let preview = preview.clone();
        let status = status.clone();
        let note_len = Rc::clone(&note_len);
        let count = Rc::clone(&count);
        let tab = Rc::clone(&tab);
        let notifications = Rc::clone(&notifications);
        move |entry| {
            let value = entry.text();
            note_len.set(value.chars().count());
            preview.set_label(&if value.is_empty() {
                "Preview: (empty)".to_owned()
            } else {
                format!("Preview: {value}")
            });
            status.set_label(&status_text(
                tab.get(),
                count.get(),
                note_len.get(),
                notifications.get(),
            ));
        }
    });
    let clear = Button::with_label("Clear");
    clear.connect_clicked({
        let note = note.clone();
        move |_| note.set_text("")
    });

    let notes = Box::new(Orientation::Vertical, 12);
    notes.set_margin_start(16);
    notes.set_margin_end(16);
    notes.set_margin_top(16);
    notes.append(&Label::new(Some("Notes")));
    notes.append(&Label::new(Some("Note")));
    notes.append(&note);
    notes.append(&preview);
    notes.append(&clear);

    let notify = CheckButton::with_label("Notifications");
    notify.set_active(true);
    notify.connect_toggled({
        let status = status.clone();
        let notifications = Rc::clone(&notifications);
        let count = Rc::clone(&count);
        let tab = Rc::clone(&tab);
        let note_len = Rc::clone(&note_len);
        move |button| {
            notifications.set(button.is_active());
            status.set_label(&status_text(
                tab.get(),
                count.get(),
                note_len.get(),
                notifications.get(),
            ));
        }
    });
    let display_name = Entry::new();
    display_name.set_text(APP_NAME);
    let apply = Button::with_label("Apply");
    apply.connect_clicked({
        let display_name = display_name.clone();
        let status = status.clone();
        move |_| {
            let name = display_name.text().to_string();
            status.set_label(&format!("Settings · Saved as {name}"));
        }
    });

    let settings = Box::new(Orientation::Vertical, 12);
    settings.set_margin_start(16);
    settings.set_margin_end(16);
    settings.set_margin_top(16);
    settings.append(&Label::new(Some("Settings")));
    settings.append(&notify);
    settings.append(&Label::new(Some("Display name")));
    settings.append(&display_name);
    settings.append(&apply);

    let notebook = Notebook::new();
    notebook.set_widget_name("tabs");
    notebook.append_page(&home, Some(&Label::new(Some("Home"))));
    notebook.append_page(&notes, Some(&Label::new(Some("Notes"))));
    notebook.append_page(&settings, Some(&Label::new(Some("Settings"))));
    notebook.connect_switch_page({
        let status = status.clone();
        let tab = Rc::clone(&tab);
        let count = Rc::clone(&count);
        let note_len = Rc::clone(&note_len);
        let notifications = Rc::clone(&notifications);
        move |_, _, page| {
            tab.set(page);
            status.set_label(&status_text(
                page,
                count.get(),
                note_len.get(),
                notifications.get(),
            ));
        }
    });

    let layout = Box::new(Orientation::Vertical, 8);
    layout.append(&header);
    layout.append(&notebook);
    layout.append(&status);
    layout
}

fn build_window(app: &Application) {
    ApplicationWindow::builder()
        .application(app)
        .title(APP_NAME)
        .resizable(true)
        .child(&build_content())
        .build()
        .present();
}

fn main() -> gtk4::glib::ExitCode {
    let app = Application::builder().application_id(APP_ID).build();
    app.connect_activate(build_window);
    app.run()
}

#[cfg(test)]
mod tests {
    use super::{build_content, counter_text};
    use gtk4::prelude::*;
    use gtk4::{Button, Label, Widget};

    fn find_named(root: &impl IsA<Widget>, name: &str) -> Option<Widget> {
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
    fn updating_controls_shows_the_count_and_unicode_note_length() {
        gtk4::init().expect("these widget tests need a display; run them under xvfb-run");

        let content = build_content();
        let counter_label = find_named(&content, "count")
            .and_then(|widget| widget.downcast::<Label>().ok())
            .expect("the counter label is named count");
        let button = find_named(&content, "increment")
            .and_then(|widget| widget.downcast::<Button>().ok())
            .expect("the increment button is named increment");

        assert_eq!(counter_label.label(), "Count: 0");

        button.emit_clicked();
        assert_eq!(counter_label.label(), "Count: 1");

        button.emit_clicked();
        assert_eq!(counter_label.label(), "Count: 2");

        let note = find_named(&content, "note")
            .and_then(|widget| widget.downcast::<gtk4::Entry>().ok())
            .expect("the note entry is named note");
        let tabs = find_named(&content, "tabs")
            .and_then(|widget| widget.downcast::<gtk4::Notebook>().ok())
            .expect("the notebook is named tabs");
        let status = find_named(&content, "status")
            .and_then(|widget| widget.downcast::<Label>().ok())
            .expect("the status label is named status");
        tabs.set_current_page(Some(1));

        for (text, count) in [("é", 1), ("😀", 1), ("e\u{301}", 2), ("é😀", 2), ("", 0)] {
            note.set_text(text);
            assert_eq!(status.label(), format!("Notes · {count} characters"));
        }
    }
}

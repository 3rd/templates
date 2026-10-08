use std::cell::Cell;
use std::error::Error;
use std::rc::Rc;

use wxdragon::prelude::*;

const TITLE: &str = "rs-gui-wxwidgets";

fn main() -> Result<(), Box<dyn Error>> {
    wxdragon::main(|_| {
        let frame = Frame::builder().with_title(TITLE).build();

        let header_label = StaticText::builder(&frame).with_label(TITLE).build();
        let lede = StaticText::builder(&frame)
            .with_label("Starter workspace")
            .build();
        let badge = StaticText::builder(&frame).with_label("starter").build();
        let status = StaticText::builder(&frame)
            .with_label("Home · Count 0")
            .build();

        let notebook = Notebook::builder(&frame).build();

        let home = Panel::builder(&notebook).build();
        let home_title = StaticText::builder(&home).with_label("Home").build();
        let home_intro = StaticText::builder(&home)
            .with_label("A desktop shell with tabs, a content pane, and a few working controls.")
            .build();
        let counter = StaticText::builder(&home).with_label("Count: 0").build();
        let increment = Button::builder(&home).with_label("Increment").build();
        let reset = Button::builder(&home).with_label("Reset").build();
        let home_buttons = BoxSizer::builder(Orientation::Horizontal).build();
        home_buttons.add(&increment, 0, SizerFlag::All, 4);
        home_buttons.add(&reset, 0, SizerFlag::All, 4);
        let home_sizer = BoxSizer::builder(Orientation::Vertical).build();
        home_sizer.add(&home_title, 0, SizerFlag::All, 8);
        home_sizer.add(&home_intro, 0, SizerFlag::All, 8);
        home_sizer.add(&counter, 0, SizerFlag::All, 8);
        home_sizer.add_sizer(&home_buttons, 0, SizerFlag::All, 4);
        home.set_sizer(home_sizer, true);

        let notes = Panel::builder(&notebook).build();
        let notes_title = StaticText::builder(&notes).with_label("Notes").build();
        let note_label = StaticText::builder(&notes).with_label("Note").build();
        let note = TextCtrl::builder(&notes).build();
        let preview = StaticText::builder(&notes)
            .with_label("Preview: (empty)")
            .build();
        let clear = Button::builder(&notes).with_label("Clear").build();
        let notes_sizer = BoxSizer::builder(Orientation::Vertical).build();
        notes_sizer.add(&notes_title, 0, SizerFlag::All, 8);
        notes_sizer.add(&note_label, 0, SizerFlag::All, 8);
        notes_sizer.add(&note, 0, SizerFlag::Expand | SizerFlag::All, 8);
        notes_sizer.add(&preview, 0, SizerFlag::All, 8);
        notes_sizer.add(&clear, 0, SizerFlag::All, 8);
        notes.set_sizer(notes_sizer, true);

        let settings = Panel::builder(&notebook).build();
        let settings_title = StaticText::builder(&settings).with_label("Settings").build();
        let notifications = CheckBox::builder(&settings)
            .with_label("Notifications")
            .build();
        notifications.set_value(true);
        let name_label = StaticText::builder(&settings)
            .with_label("Display name")
            .build();
        let display_name = TextCtrl::builder(&settings).with_value(TITLE).build();
        let apply = Button::builder(&settings).with_label("Apply").build();
        let settings_sizer = BoxSizer::builder(Orientation::Vertical).build();
        settings_sizer.add(&settings_title, 0, SizerFlag::All, 8);
        settings_sizer.add(&notifications, 0, SizerFlag::All, 8);
        settings_sizer.add(&name_label, 0, SizerFlag::All, 8);
        settings_sizer.add(&display_name, 0, SizerFlag::Expand | SizerFlag::All, 8);
        settings_sizer.add(&apply, 0, SizerFlag::All, 8);
        settings.set_sizer(settings_sizer, true);

        notebook.add_page(&home, "Home", true, None);
        notebook.add_page(&notes, "Notes", false, None);
        notebook.add_page(&settings, "Settings", false, None);

        let count = Rc::new(Cell::new(0u32));
        increment.on_click({
            let count = Rc::clone(&count);
            move |_| {
                count.set(count.get() + 1);
                counter.set_label(&format!("Count: {}", count.get()));
                status.set_label(&format!("Home · Count {}", count.get()));
            }
        });
        reset.on_click({
            let count = Rc::clone(&count);
            move |_| {
                count.set(0);
                counter.set_label("Count: 0");
                status.set_label("Home · Count 0");
            }
        });
        note.on_text_updated(move |_| {
            let value = note.get_value();
            preview.set_label(&if value.is_empty() {
                "Preview: (empty)".to_owned()
            } else {
                format!("Preview: {value}")
            });
            status.set_label(&format!("Notes · {} characters", value.chars().count()));
        });
        clear.on_click(move |_| note.set_value(""));
        notifications.on_toggled(move |_| {
            status.set_label(&format!(
                "Settings · Notifications {}",
                if notifications.get_value() { "on" } else { "off" }
            ));
        });
        apply.on_click(move |_| {
            status.set_label(&format!("Settings · Saved as {}", display_name.get_value()));
        });
        notebook.on_page_changed(move |event| match event.get_selection().unwrap_or(0) {
            0 => status.set_label(&format!("Home · Count {}", count.get())),
            1 => status.set_label(&format!(
                "Notes · {} characters",
                note.get_value().chars().count()
            )),
            2 => status.set_label(&format!(
                "Settings · Notifications {}",
                if notifications.get_value() { "on" } else { "off" }
            )),
            _ => {}
        });

        let header = BoxSizer::builder(Orientation::Horizontal).build();
        let titles = BoxSizer::builder(Orientation::Vertical).build();
        titles.add(&header_label, 0, SizerFlag::All, 2);
        titles.add(&lede, 0, SizerFlag::All, 2);
        header.add_sizer(&titles, 1, SizerFlag::Expand | SizerFlag::All, 8);
        header.add(&badge, 0, SizerFlag::All, 8);

        let sizer = BoxSizer::builder(Orientation::Vertical).build();
        sizer.add_sizer(&header, 0, SizerFlag::Expand | SizerFlag::All, 4);
        sizer.add(&notebook, 1, SizerFlag::Expand | SizerFlag::All, 8);
        sizer.add(&status, 0, SizerFlag::All, 8);

        frame.set_sizer(sizer, true);
        frame.show(true);
        frame.centre();
    })
}

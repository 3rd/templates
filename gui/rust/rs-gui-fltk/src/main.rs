use std::cell::Cell;
use std::rc::Rc;

use fltk::{
    app,
    button::{Button, CheckButton},
    enums::{Align, CallbackTrigger},
    frame::Frame,
    group::{Flex, Tabs},
    input::Input,
    prelude::*,
    window::Window,
};

const TITLE: &str = "rs-gui-fltk";

#[derive(Clone, Copy)]
enum Tab {
    Home,
    Notes,
    Settings,
}

fn status_text(tab: Tab, count: u32, note: &str, notifications: bool) -> String {
    match tab {
        Tab::Home => format!("Home · Count {count}"),
        Tab::Notes => format!("Notes · {} characters", note.chars().count()),
        Tab::Settings => format!(
            "Settings · Notifications {}",
            if notifications { "on" } else { "off" }
        ),
    }
}

fn main() {
    let app = app::App::default();

    let mut window = Window::default().with_size(800, 600).with_label(TITLE);

    let mut root = Flex::default_fill().column();
    root.set_margin(8);
    root.set_pad(8);

    let mut header = Flex::default().row();
    let mut heading = Frame::default().with_label(TITLE);
    heading.set_label_size(18);
    heading.set_align(Align::Inside | Align::Left);
    let mut badge = Frame::default().with_label("starter");
    badge.set_align(Align::Inside | Align::Right);
    header.fixed(&badge, 80);
    header.end();
    root.fixed(&header, 36);

    let mut tabs = Tabs::default_fill();

    let mut home = Flex::default().with_label("Home\t").column();
    home.set_margin(16);
    home.set_pad(10);
    Frame::default().with_label("Home");
    Frame::default()
        .with_label("A desktop shell with tabs, a content pane, and a few working controls.");
    let counter = Frame::default().with_label("Count: 0");
    let mut home_buttons = Flex::default().row();
    let mut increment = Button::default().with_label("Increment");
    let mut reset = Button::default().with_label("Reset");
    home_buttons.fixed(&increment, 110);
    home_buttons.fixed(&reset, 80);
    home_buttons.end();
    home.fixed(&home_buttons, 32);
    home.end();

    let mut notes = Flex::default().with_label("Notes\t").column();
    notes.set_margin(16);
    notes.set_pad(10);
    Frame::default().with_label("Notes");
    Frame::default().with_label("Note");
    let mut note = Input::default();
    note.set_trigger(CallbackTrigger::Changed);
    notes.fixed(&note, 28);
    let mut preview = Frame::default().with_label("Preview: (empty)");
    preview.set_align(Align::Inside | Align::Left);
    let mut clear = Button::default().with_label("Clear");
    notes.fixed(&clear, 32);
    notes.end();

    let mut settings = Flex::default().with_label("Settings\t").column();
    settings.set_margin(16);
    settings.set_pad(10);
    Frame::default().with_label("Settings");
    let mut notifications = CheckButton::default().with_label("Notifications");
    notifications.set_checked(true);
    settings.fixed(&notifications, 28);
    Frame::default().with_label("Display name");
    let mut display_name = Input::default();
    display_name.set_value(TITLE);
    settings.fixed(&display_name, 28);
    let mut apply = Button::default().with_label("Apply");
    settings.fixed(&apply, 32);
    settings.end();

    tabs.end();
    tabs.auto_layout();

    let mut status = Frame::default().with_label(&status_text(Tab::Home, 0, "", true));
    status.set_align(Align::Inside | Align::Left);
    root.fixed(&status, 28);

    root.end();
    window.end();
    window.make_resizable(true);
    window.show();

    let count = Rc::new(Cell::new(0u32));
    tabs.set_callback({
        let count = Rc::clone(&count);
        let note = note.clone();
        let notifications = notifications.clone();
        let notes = notes.clone();
        let settings = settings.clone();
        let mut status = status.clone();
        move |tabs| {
            let tab = match tabs.value() {
                Some(group) if group.is_same(&notes) => Tab::Notes,
                Some(group) if group.is_same(&settings) => Tab::Settings,
                _ => Tab::Home,
            };
            status.set_label(&status_text(
                tab,
                count.get(),
                &note.value(),
                notifications.is_checked(),
            ));
        }
    });
    increment.set_callback({
        let count = Rc::clone(&count);
        let mut counter = counter.clone();
        let note = note.clone();
        let notifications = notifications.clone();
        let mut status = status.clone();
        move |_| {
            count.set(count.get() + 1);
            counter.set_label(&format!("Count: {}", count.get()));
            status.set_label(&status_text(
                Tab::Home,
                count.get(),
                &note.value(),
                notifications.is_checked(),
            ));
        }
    });
    reset.set_callback({
        let count = Rc::clone(&count);
        let mut counter = counter.clone();
        let note = note.clone();
        let notifications = notifications.clone();
        let mut status = status.clone();
        move |_| {
            count.set(0);
            counter.set_label("Count: 0");
            status.set_label(&status_text(
                Tab::Home,
                0,
                &note.value(),
                notifications.is_checked(),
            ));
        }
    });
    note.set_callback({
        let count = Rc::clone(&count);
        let notifications = notifications.clone();
        let mut preview = preview.clone();
        let mut status = status.clone();
        move |input| {
            let value = input.value();
            preview.set_label(&if value.is_empty() {
                "Preview: (empty)".to_owned()
            } else {
                format!("Preview: {value}")
            });
            status.set_label(&status_text(
                Tab::Notes,
                count.get(),
                &value,
                notifications.is_checked(),
            ));
        }
    });
    clear.set_callback({
        let mut note = note.clone();
        move |_| {
            note.set_value("");
            note.do_callback();
        }
    });
    notifications.set_callback({
        let count = Rc::clone(&count);
        let note = note.clone();
        let mut status = status.clone();
        move |button| {
            status.set_label(&status_text(
                Tab::Settings,
                count.get(),
                &note.value(),
                button.is_checked(),
            ));
        }
    });
    apply.set_callback({
        let display_name = display_name.clone();
        let mut status = status.clone();
        move |_| {
            status.set_label(&format!("Settings · Saved as {}", display_name.value()));
        }
    });

    app.run().unwrap();
}

use eframe::egui;

const APP_NAME: &str = "rs-gui-egui";

fn main() -> eframe::Result {
    let options = eframe::NativeOptions {
        viewport: egui::ViewportBuilder::default()
            .with_title(APP_NAME)
            .with_resizable(true),
        ..Default::default()
    };

    eframe::run_native(
        APP_NAME,
        options,
        Box::new(|_cc| Ok(Box::<Workspace>::default())),
    )
}

#[derive(Clone, Copy, PartialEq, Eq, Default)]
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
    saved_message: String,
}

impl Default for Workspace {
    fn default() -> Self {
        Self {
            tab: Tab::Home,
            count: 0,
            note: String::new(),
            notifications: true,
            display_name: APP_NAME.to_owned(),
            saved_message: String::new(),
        }
    }
}

impl Workspace {
    fn status(&self) -> String {
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

impl eframe::App for Workspace {
    fn ui(&mut self, ui: &mut egui::Ui, _frame: &mut eframe::Frame) {
        egui::CentralPanel::default().show(ui, |ui| {
            ui.horizontal(|ui| {
                ui.heading(APP_NAME);
                ui.label("Starter workspace");
                ui.with_layout(egui::Layout::right_to_left(egui::Align::Center), |ui| {
                    ui.label("starter");
                });
            });
            ui.horizontal(|ui| {
                ui.selectable_value(&mut self.tab, Tab::Home, "Home");
                ui.selectable_value(&mut self.tab, Tab::Notes, "Notes");
                ui.selectable_value(&mut self.tab, Tab::Settings, "Settings");
            });
            ui.separator();

            match self.tab {
                Tab::Home => {
                    ui.heading("Home");
                    ui.label(
                        "A desktop shell with tabs, a content pane, and a few working controls.",
                    );
                    ui.label(format!("Count: {}", self.count));
                    ui.horizontal(|ui| {
                        if ui.button("Increment").clicked() {
                            self.count += 1;
                        }

                        if ui.button("Reset").clicked() {
                            self.count = 0;
                        }
                    });
                }
                Tab::Notes => {
                    ui.heading("Notes");
                    ui.label("Note");
                    ui.text_edit_singleline(&mut self.note);
                    ui.label(if self.note.is_empty() {
                        "Preview: (empty)".to_owned()
                    } else {
                        format!("Preview: {}", self.note)
                    });

                    if ui.button("Clear").clicked() {
                        self.note.clear();
                    }
                }
                Tab::Settings => {
                    ui.heading("Settings");
                    ui.checkbox(&mut self.notifications, "Notifications");
                    ui.label("Display name");
                    ui.text_edit_singleline(&mut self.display_name);

                    if ui.button("Apply").clicked() {
                        self.saved_message = format!("Settings · Saved as {}", self.display_name);
                    }

                    ui.label(&self.saved_message);
                }
            }

            ui.with_layout(egui::Layout::bottom_up(egui::Align::Min), |ui| {
                ui.label(self.status());
            });
        });
    }
}

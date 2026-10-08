use cxx_qt_build::{CxxQtBuilder, QmlModule};

fn main() {
    CxxQtBuilder::new_qml_module(QmlModule::new("com.example.rsguiqt").qml_file("qml/main.qml"))
        .qt_module("Network")
        .files(["src/counter.rs"])
        .build();
}

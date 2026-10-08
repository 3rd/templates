import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import com.example.rsguiqt

ApplicationWindow {
    id: root

    readonly property Counter counter: Counter {}
    property string note: ""
    property bool notifications: true
    property string displayName: "rs-gui-qt"
    property string statusMessage: ""

    onNotificationsChanged: statusMessage = ""
    onDisplayNameChanged: statusMessage = ""

    title: "rs-gui-qt"
    visible: true

    header: ToolBar {
        RowLayout {
            anchors.fill: parent
            anchors.margins: 8

            ColumnLayout {
                Label {
                    font.pixelSize: 18
                    text: "rs-gui-qt"
                }
                Label {
                    opacity: 0.7
                    text: "Starter workspace"
                }
            }

            Item {
                Layout.fillWidth: true
            }

            Label {
                text: "starter"
            }
        }
    }

    footer: Label {
        leftPadding: 16
        padding: 8
        text: {
            if (root.statusMessage !== "") {
                return root.statusMessage;
            }

            if (tabs.currentIndex === 1) {
                let count = 0;

                for (let index = 0; index < root.note.length; index++) {
                    count++;

                    if (root.note.codePointAt(index) > 0xffff) {
                        index++;
                    }
                }

                return qsTr("Notes · %1 characters").arg(count);
            }

            if (tabs.currentIndex === 2)
                return qsTr("Settings · Notifications %1").arg(root.notifications ? "on" : "off");
            return qsTr("Home · Count %1").arg(root.counter.count);
        }
    }

    ColumnLayout {
        anchors.fill: parent
        spacing: 0

        TabBar {
            id: tabs
            onCurrentIndexChanged: root.statusMessage = ""

            Layout.fillWidth: true

            TabButton {
                text: qsTr("Home")
            }
            TabButton {
                text: qsTr("Notes")
            }
            TabButton {
                text: qsTr("Settings")
            }
        }

        StackLayout {
            Layout.fillHeight: true
            Layout.fillWidth: true
            currentIndex: tabs.currentIndex

            ColumnLayout {
                spacing: 12

                Label {
                    font.pixelSize: 16
                    text: qsTr("Home")
                }
                Label {
                    wrapMode: Text.WordWrap
                    text: qsTr("A desktop shell with tabs, a content pane, and a few working controls.")
                }
                Label {
                    text: qsTr("Count: %1").arg(root.counter.count)
                }
                RowLayout {
                    Button {
                        text: qsTr("Increment")
                        onClicked: root.counter.increment()
                    }
                    Button {
                        text: qsTr("Reset")
                        onClicked: root.counter.reset()
                    }
                }
            }

            ColumnLayout {
                spacing: 12

                Label {
                    font.pixelSize: 16
                    text: qsTr("Notes")
                }
                Label {
                    text: qsTr("Note")
                }
                TextField {
                    Layout.fillWidth: true
                    placeholderText: qsTr("Write a note")
                    text: root.note
                    onTextChanged: root.note = text
                }
                Label {
                    text: root.note === "" ? qsTr("Preview: (empty)") : qsTr("Preview: %1").arg(root.note)
                }
                Button {
                    text: qsTr("Clear")
                    onClicked: root.note = ""
                }
            }

            ColumnLayout {
                spacing: 12

                Label {
                    font.pixelSize: 16
                    text: qsTr("Settings")
                }
                CheckBox {
                    checked: root.notifications
                    text: qsTr("Notifications")
                    onToggled: root.notifications = checked
                }
                Label {
                    text: qsTr("Display name")
                }
                TextField {
                    Layout.fillWidth: true
                    text: root.displayName
                    onTextChanged: root.displayName = text
                }
                Button {
                    text: qsTr("Apply")
                    onClicked: root.statusMessage = qsTr("Settings · Saved as %1").arg(root.displayName)
                }
            }
        }
    }
}

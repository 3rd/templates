#[cxx_qt::bridge]
pub mod qobject {
    extern "RustQt" {
        #[qobject]
        #[qml_element]
        #[qproperty(i32, count)]
        type Counter = super::CounterRust;

        #[qinvokable]
        fn increment(self: Pin<&mut Self>);

        #[qinvokable]
        fn reset(self: Pin<&mut Self>);
    }
}

use core::pin::Pin;

#[derive(Default)]
pub struct CounterRust {
    count: i32,
}

impl qobject::Counter {
    fn increment(self: Pin<&mut Self>) {
        let next = *self.count() + 1;
        self.set_count(next);
    }

    fn reset(self: Pin<&mut Self>) {
        self.set_count(0);
    }
}

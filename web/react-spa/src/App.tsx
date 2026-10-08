import { Link, Redirect, Route, Switch, useLocation } from "wouter";
import { DashboardLayout } from "./components/DashboardLayout";
import { DashboardRoute } from "./routes/DashboardRoute";
import { NotFoundRoute } from "./routes/NotFoundRoute";
import { SettingsRoute } from "./routes/SettingsRoute";
import { TasksRoute } from "./routes/TasksRoute";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/tasks", label: "Tasks" },
  { href: "/settings", label: "Settings" },
];

export const App = () => {
  const [location] = useLocation();

  return (
    <DashboardLayout
      navItems={navItems.map((item) => {
        const isCurrent = location === item.href;

        return {
          ...item,
          current: isCurrent,
          link: (
            <Link aria-current={isCurrent ? "page" : undefined} href={item.href}>
              {item.label}
            </Link>
          ),
        };
      })}
    >
      <Switch>
        <Route path="/">
          <Redirect to="/dashboard" />
        </Route>
        <Route path="/dashboard" component={DashboardRoute} />
        <Route path="/tasks" component={TasksRoute} />
        <Route path="/settings" component={SettingsRoute} />
        <Route component={NotFoundRoute} />
      </Switch>
    </DashboardLayout>
  );
};

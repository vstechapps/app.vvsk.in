import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Login } from './components/login/login';
import { Logout } from './components/logout/logout';
import { Dashboard } from './components/dashboard/dashboard';
import { Profile } from './components/profile/profile';
import { canActivate, redirectUnauthorizedTo, redirectLoggedInTo } from '@angular/fire/auth-guard';
import { MyBanner } from './components/mybanner/mybanner';
import { NoInternet } from './components/no-internet/no-internet';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);
const redirectLoggedInToDashboard = () => redirectLoggedInTo(['dashboard']);

export const routes: Routes = [
    { path: '', component: Home, ...canActivate(redirectLoggedInToDashboard) },
    { path: 'login', component: Login, ...canActivate(redirectLoggedInToDashboard) },
    { path: 'logout', component: Logout },
    { path: 'dashboard', component: Dashboard, ...canActivate(redirectUnauthorizedToLogin) },
    { path: 'profile', component: Profile, ...canActivate(redirectUnauthorizedToLogin) },
    { path: 'banner', component: MyBanner },
    { path: 'no-internet', component: NoInternet },
    { path: '**', redirectTo: '' }
];

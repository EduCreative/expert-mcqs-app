
import { useState } from 'react';
import type { MouseEvent } from 'react';
import { AppBar, Toolbar, IconButton, Typography, Box, Tooltip, Menu, MenuItem, Button } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import SettingsIcon from '@mui/icons-material/Settings';
import TextIncreaseIcon from '@mui/icons-material/TextIncrease';
import TextDecreaseIcon from '@mui/icons-material/TextDecrease';
import ShareIcon from '@mui/icons-material/Share';
import InstallPWA from './InstallPWA';
import { useAuth } from '../providers/AuthProvider';
import { useUI } from '../providers/UIProvider';


export interface TopBarProps {
	onToggleLeftMenu: () => void;
	onOpenTopMenu: (anchor: HTMLElement) => void;
}

export default function TopBar({ onToggleLeftMenu, onOpenTopMenu }: TopBarProps) {
		const { user, logout } = useAuth();
		const displayName = user?.displayName || 'Guest';
		const totalScore = user?.scoreByCategory ? Object.values(user.scoreByCategory).reduce((a, b) => a + b, 0) : 0;
	const { mode, setMode, fontSize, setFontSize, lastSyncedAt } = useUI();
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);

	return (
		<AppBar position="sticky" color="transparent" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
			<Toolbar sx={{ gap: 1, flexDirection: 'column', p: 0 }}>
				{/* Top row: logo, app name, install, controls */}
				<Box sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 } }}>
					{/* Hamburger menu (desktop left, mobile left for menu) */}
					<Box sx={{ display: { xs: 'none', md: 'flex' } }}>
						<IconButton color="inherit" onClick={onToggleLeftMenu} sx={{ mr: { xs: 1, md: 2 }, p: { xs: 1, md: 2 } }}>
							<MenuIcon sx={{ fontSize: { xs: 24, md: 36 } }} />
						</IconButton>
					</Box>
					<Box sx={{ display: { xs: 'flex', md: 'none' } }}>
						<IconButton color="inherit" onClick={(e: MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget)} sx={{ mr: 1 }}>
							<MenuIcon />
						</IconButton>
					</Box>
					<img src="/icons/icon.svg" width="40" alt="logo" className="topbar-logo" />
					<Typography variant="h6" sx={{ fontWeight: 800, fontSize: { xs: 20, md: 32 } }}>Expert MCQs</Typography>
					{/* InstallPWA next to app name in desktop */}
					<Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', ml: 2 }}>
						<InstallPWA />
					</Box>
					{/* Desktop controls: user, pts, theme, font, settings, share, logout, all in top row */}
					<Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1, ml: 'auto' }}>
						<Typography variant="body2" sx={{ fontWeight: 600 }}>{displayName}</Typography>
									{user ? (
										<Button size="small" variant="outlined" disabled sx={{ minWidth: 70 }}>{totalScore} pts</Button>
									) : (
										<Button size="small" startIcon={<LoginIcon />} href="#/auth">Register Now</Button>
									)}
						<Tooltip title="Toggle theme">
							<IconButton color="inherit" onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}>
								{mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
							</IconButton>
						</Tooltip>
						<Tooltip title="Font size">
							<IconButton color="inherit" onClick={() => setFontSize(fontSize === 'sm' ? 'md' : fontSize === 'md' ? 'lg' : fontSize === 'lg' ? 'xl' : 'sm')}>
								<TextIncreaseIcon />
							</IconButton>
						</Tooltip>
						<Tooltip title="Decrease font">
							<IconButton color="inherit" onClick={() => setFontSize(fontSize === 'xl' ? 'lg' : fontSize === 'lg' ? 'md' : fontSize === 'md' ? 'sm' : 'sm')}>
								<TextDecreaseIcon />
							</IconButton>
						</Tooltip>
						<Tooltip title={lastSyncedAt ? `Last sync: ${new Date(lastSyncedAt).toLocaleString()}` : 'Settings & sync info'}>
							<IconButton color="inherit" onClick={(e) => onOpenTopMenu(e.currentTarget)}>
								<SettingsIcon />
							</IconButton>
						</Tooltip>
						<Tooltip title="Share">
							<IconButton color="inherit" onClick={async () => {
								if (navigator.share) {
									try {
										await navigator.share({ title: 'Expert MCQs', url: location.href });
									} catch (err) {
										alert('Share cancelled or failed.');
									}
								} else {
									try {
										await navigator.clipboard.writeText(location.href);
										alert('Link copied to clipboard!');
									} catch {
										alert('Share not supported.');
									}
								}
							}}>
								<ShareIcon />
							</IconButton>
						</Tooltip>
						{user && (
							<Tooltip title="Logout">
								<IconButton color="inherit" onClick={() => logout()}>
									<LogoutIcon />
								</IconButton>
							</Tooltip>
						)}
					</Box>
					{/* Hamburger menu (right, mobile only, after InstallPWA, now for drawer) */}
					<Box sx={{ display: { xs: 'flex', md: 'none' } }}>
						<InstallPWA />
						<IconButton color="inherit" onClick={onToggleLeftMenu}>
							<MenuIcon />
						</IconButton>
					</Box>
				</Box>
				{/* Second row: user, pts, controls, hamburger at end (MOBILE ONLY) */}
				<Box sx={{ width: '100%', display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1, mt: 0.5 }}>
					{/* User and points at the start */}
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
						<Typography variant="body2" sx={{ fontWeight: 600 }}>{displayName}</Typography>
									{user ? (
										<Button size="small" variant="outlined" disabled sx={{ minWidth: 70 }}>{totalScore} pts</Button>
									) : (
										<Button size="small" startIcon={<LoginIcon />} href="#/auth">Register</Button>
									)}
					</Box>
					{/* Controls group: light mode, font size, settings, share, logout */}
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						<Tooltip title="Toggle theme">
							<IconButton color="inherit" onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}>
								{mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
							</IconButton>
						</Tooltip>
						<Tooltip title="Font size">
							<IconButton color="inherit" onClick={() => setFontSize(fontSize === 'sm' ? 'md' : fontSize === 'md' ? 'lg' : fontSize === 'lg' ? 'xl' : 'sm')}>
								<TextIncreaseIcon />
							</IconButton>
						</Tooltip>
						<Tooltip title="Decrease font">
							<IconButton color="inherit" onClick={() => setFontSize(fontSize === 'xl' ? 'lg' : fontSize === 'lg' ? 'md' : fontSize === 'md' ? 'sm' : 'sm')}>
								<TextDecreaseIcon />
							</IconButton>
						</Tooltip>
						<Tooltip title={lastSyncedAt ? `Last sync: ${new Date(lastSyncedAt).toLocaleString()}` : 'Settings & sync info'}>
							<IconButton color="inherit" onClick={(e) => onOpenTopMenu(e.currentTarget)}>
								<SettingsIcon />
							</IconButton>
						</Tooltip>
						<Tooltip title="Share">
							<IconButton color="inherit" onClick={async () => {
								if (navigator.share) {
									try {
										await navigator.share({ title: 'Expert MCQs', url: location.href });
									} catch (err) {
										alert('Share cancelled or failed.');
									}
								} else {
									try {
										await navigator.clipboard.writeText(location.href);
										alert('Link copied to clipboard!');
									} catch {
										alert('Share not supported.');
									}
								}
							}}>
								<ShareIcon />
							</IconButton>
						</Tooltip>
						{user && (
							<Tooltip title="Logout">
								<IconButton color="inherit" onClick={() => logout()}>
									<LogoutIcon />
								</IconButton>
							</Tooltip>
						)}
					</Box>
				</Box>
				{/* Mobile menu (right, after InstallPWA) */}
				<Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
					<MenuItem onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}>{mode === 'light' ? 'Dark' : 'Light'} Mode</MenuItem>
					<MenuItem onClick={() => setFontSize('sm')}>Font: Small</MenuItem>
					<MenuItem onClick={() => setFontSize('md')}>Font: Medium</MenuItem>
					<MenuItem onClick={() => setFontSize('lg')}>Font: Large</MenuItem>
					<MenuItem onClick={() => setFontSize('xl')}>Font: X-Large</MenuItem>
					{user ? (
						<MenuItem onClick={() => logout()}>Logout</MenuItem>
					) : (
						<MenuItem component="a" href="#/auth">Login</MenuItem>
					)}
					<MenuItem onClick={async () => { if (navigator.share) await navigator.share({ title: 'Expert MCQs', url: location.href }) }}>Share</MenuItem>
				</Menu>
			</Toolbar>
		</AppBar>
	);
}

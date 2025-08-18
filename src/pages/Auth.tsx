import { useState } from 'react'
import { Box, Button, Card, CardContent, Divider, FormControlLabel, Stack, Switch, TextField, Typography, IconButton, InputAdornment, Alert } from '@mui/material'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import { RecaptchaVerifier } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { auth } from '../firebase'
import GoogleIcon from '@mui/icons-material/Google'
import EmailIcon from '@mui/icons-material/Email'
import { useAuth } from '../providers/AuthProvider'

export default function AuthPage() {
  const navigate = useNavigate()
  const { loginWithGoogle, loginAnonymously, loginWithEmail, registerWithEmail, resetPassword, loginWithPhone, confirmPhoneCode } = useAuth()
  const [isRegister, setIsRegister] = useState(false)
  const [remember, setRemember] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [confirmation, setConfirmation] = useState<any>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorText, setErrorText] = useState<string | null>(null)

  return (
    <Box sx={{ maxWidth: 480, mx: 'auto', mt: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 2 }}>{isRegister ? 'Register' : 'Login'}</Typography>
          <Stack spacing={2}>
            {isRegister && (
              <TextField label="Full name" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
            )}
            <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />
            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton aria-label="toggle password visibility" onClick={() => setShowPassword((s) => !s)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Stack direction="row" spacing={2} alignItems="center">
              <Button variant="contained" disabled={loading} startIcon={<EmailIcon />} onClick={async () => {
                setErrorText(null)
                setLoading(true)
                try {
                  if (!email || !password || (isRegister && !name)) {
                    throw new Error('Please fill all required fields.')
                  }
                  if (isRegister) {
                    await registerWithEmail(name, email, password)
                    // After registration, the display name may take a moment to reflect
                    // Just allow redirect; the header will update on the next auth state
                  }
                  else await loginWithEmail(email, password, remember)
                  navigate('/')
                } catch (e: any) {
                  setErrorText(e?.message || 'Failed. Please check your details and try again.')
                } finally {
                  setLoading(false)
                }
              }}>{isRegister ? 'Create account' : 'Login'}</Button>
              <Button variant="text" onClick={() => setIsRegister(!isRegister)}>{isRegister ? 'Have an account? Login' : 'New user? Register'}</Button>
              <FormControlLabel control={<Switch checked={remember} onChange={(e) => setRemember(e.target.checked)} />} label="Remember me" />
            </Stack>
            {errorText && <Alert severity="error">{errorText}</Alert>}
            <Button variant="text" onClick={async () => { if (email) await resetPassword(email) }}>Lost password?</Button>
            <Divider>or</Divider>
            <Button variant="outlined" startIcon={<GoogleIcon />} onClick={loginWithGoogle}>Continue with Google</Button>
            <Button variant="outlined" onClick={loginAnonymously}>Continue as Guest</Button>
            <Typography variant="caption">Remember me is enabled by default (uses local persistence).</Typography>
            <Divider>or phone</Divider>
            <Stack spacing={1}>
              <TextField label="Phone number (+123...)" value={phone} onChange={(e) => setPhone(e.target.value)} fullWidth />
              <Stack direction="row" spacing={1}>
                <Button variant="outlined" onClick={async () => {
                  // @ts-ignore
                  const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' })
                  const conf = await loginWithPhone(phone, verifier)
                  setConfirmation(conf)
                }}>Send code</Button>
                <TextField label="Code" value={code} onChange={(e) => setCode(e.target.value)} />
                <Button variant="contained" disabled={!confirmation || !code} onClick={async () => {
                  await confirmPhoneCode(confirmation, code)
                }}>Confirm</Button>
              </Stack>
              <Box id="recaptcha-container" />
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}



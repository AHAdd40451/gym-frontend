// 'use client'

// import { useState } from 'react'
// import { useRouter } from 'next/navigation'
// import { loginAction } from '@/lib/api/services/auth/actions'
// import { toast } from 'sonner' // sonner notifications

// // Shadcn UI Components
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// function Login() {
//   const router = useRouter()

//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [showPassword, setShowPassword] = useState(false)
//   const [loading, setLoading] = useState(false)

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     setLoading(true)

//     try {
//       const res = await loginAction({ email, password })

//       if (res.success) {
//         if (res.user.role === 'user') {
//           localStorage.setItem('auth-user', JSON.stringify(res.user))
//           localStorage.setItem('authToken', res.token)
//           toast.success('Login successful!')
//           router.push('/dashboard/social-media')
//         } else {
//           toast.error('Aap ke paas is page ko access karne ka permission nahi hai.')
//           localStorage.removeItem('auth-user')
//           localStorage.removeItem('authToken')
//         }
//       } else {
//         toast.error(res.message || 'Login failed. Please try again.')
//       }
//     } catch (err) {
//       toast.error('Login failed. Please try again.')
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
//       <Card className="w-full max-w-md shadow-lg">
//         <CardHeader>
//           <CardTitle className="text-center text-2xl">Login</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <form className="space-y-4" onSubmit={handleSubmit}>
//             <div>
//               <Label htmlFor="email">Email</Label>
//               <Input
//                 id="email"
//                 type="email"
//                 placeholder="Enter your email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//               />
//             </div>

//             <div>
//               <Label htmlFor="password">Password</Label>
//               <div className="relative">
//                 <Input
//                   id="password"
//                   type={showPassword ? 'text' : 'password'}
//                   placeholder="Enter your password"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   required
//                 />
//                 <Button
//                   type="button"
//                   variant="ghost"
//                   size="icon"
//                   className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
//                   onClick={() => setShowPassword(!showPassword)}
//                 >
//                   {showPassword ? 'Hide' : 'Show'}
//                 </Button>
//               </div>
//             </div>

//             <Button type="submit" className="w-full" disabled={loading}>
//               {loading ? 'Logging in...' : 'Login'}
//             </Button>
//           </form>
//         </CardContent>
//       </Card>
//     </div>
//   )
// }

// export default Login
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginAction } from '@/lib/api/services/auth/actions'
import { toast } from 'sonner'

import { Eye, EyeOff } from 'lucide-react'

// Shadcn UI
import type { FormEvent } from "react";
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'

function Login() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  
const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setLoading(true);

    try {
      const res = await loginAction({ email, password })

      if (res.success) {
        if (res.user.role === 'user') {
          localStorage.setItem('auth-user', JSON.stringify(res.user))
          localStorage.setItem('authToken', res.token)

          toast.success('Login successful!')
          router.push('/dashboard/social-media')
        } else {
          toast.error(
            'Aap ke paas is dashboard ko access karne ka permission nahi hai.'
          )

          localStorage.removeItem('auth-user')
          localStorage.removeItem('authToken')
        }
      } else {
        toast.error(res.message || 'Login failed. Please try again.')
      }
    } catch (err) {
      toast.error('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4 text-white">
      
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_35%)]" />

      {/* Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:5rem_5rem] opacity-30" />

      {/* Floating Glow */}
      <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-white/[0.03] blur-3xl" />

      <Card className="relative w-full max-w-md border border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-[0_0_80px_rgba(255,255,255,0.04)]">
        
        <CardHeader className="space-y-6 text-center">
          
          {/* Logo */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] shadow-inner">
            <div className="flex gap-1">
              <div className="h-2 w-2 rounded-full bg-white" />
              <div className="h-2 w-2 rounded-full bg-zinc-500" />
              <div className="h-2 w-2 rounded-full bg-zinc-700" />
            </div>
          </div>

          <div>
            <CardTitle className="text-3xl font-semibold tracking-tight text-white">
              Social Media Dashboard
            </CardTitle>

            <CardDescription className="mt-2 text-sm leading-6 text-zinc-500">
              Manage your content, analytics, engagement,
              and publishing from one powerful workspace.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit}>
            
            {/* Email */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-zinc-300"
              >
                Email Address
              </Label>

              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 rounded-xl border-white/10 bg-black/40 text-white placeholder:text-zinc-600 focus:border-white/20 focus:ring-0"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-zinc-300"
                >
                  Password
                </Label>

               
              </div>

              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 rounded-xl border-white/10 bg-black/40 pr-12 text-white placeholder:text-zinc-600 focus:border-white/20 focus:ring-0"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-white"
                >
                  {showPassword ? (
                    <EyeOff className='cursor-pointer' size={18} />
                  ) : (
                    <Eye className='cursor-pointer'  size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Remember */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-zinc-500">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-white/20 bg-black"
                />
                Remember me
              </label>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-xl bg-white text-black transition-all duration-300 hover:bg-zinc-200"
            >
              {loading ? 'Signing in...' : 'Access Dashboard'}
            </Button>

            {/* Bottom */}
            <p className="pt-2 text-center text-sm text-zinc-600">
              Secure access for social media managers & teams
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default Login
"use client"
import {Card,CardContent,CardDescription,CardHeader, CardTitle} from "@/components/ui/card"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useState, useTransition } from "react"
import { toast } from "sonner"


export default function VerifyRequest(){
  return (
    <Suspense fallback={<p>Loading verification form...</p>}>
      <VerifyRequestForm />
    </Suspense>
  )
}

function VerifyRequestForm(){
    const router = useRouter()
    const [otp,setOtp]=useState("")
    const [emailPending,startTransition]=useTransition();
    const params= useSearchParams()
    const email = params.get('email') as string;
    const isOtpCompleted=otp.length===6

    function verifyOtp(){
        startTransition(async()=>{
            await authClient.signIn.emailOtp({
                email,
                otp,
                fetchOptions:{
                    onSuccess:()=>{
                        toast.success("Email Verified")
                        router.push("/")
                    },
                    onError:()=>{
                        toast.error("Error verifying Email/OTP")
                    }
                }
            })
        })
    }

    return(
        <Card className="w-full mx-auto">
            <CardHeader className="text-center">
                <CardTitle className="text-xl">Please check your email</CardTitle>
                <CardDescription>We have sent a verification email code to your email address.Please open the email and paste the blow</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex flex-col items-center space-y-2">
                    <InputOTP value={otp} onChange={(value)=> setOtp(value)} maxLength={6} className="gap-2">
                        <InputOTPGroup>
                            <InputOTPSlot index={0}/>
                            <InputOTPSlot index={1}/>
                            <InputOTPSlot index={2}/>
                        </InputOTPGroup>
                         <InputOTPGroup>
                            <InputOTPSlot index={3}/>
                            <InputOTPSlot index={4}/>
                            <InputOTPSlot index={5}/>
                        </InputOTPGroup>
                    </InputOTP>
                    <p>Enter the 6-digit code send to your email</p>
                </div>

                <Button onClick={verifyOtp} disabled={emailPending || !isOtpCompleted}  className="w-full">
                    Verify Account
                </Button>

            </CardContent>
        </Card>
    )
}

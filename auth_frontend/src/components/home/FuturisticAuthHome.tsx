import { motion } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  Lock,
  Zap,
} from "lucide-react";
import { NavLink } from "react-router";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function FuturisticAuthHome() {
  return (
    <section className="relative min-h-[calc(100vh-56px)] overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-background" />

      <div className="mx-auto flex min-h-[calc(100vh-56px)] max-w-6xl items-center px-6 py-16">
        <div className="grid w-full gap-12 lg:grid-cols-2 lg:items-center">

          {/* Left */}
          <motion.div
            initial={{
              opacity: 0,
              y: 25,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.6,
            }}
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm">
              <ShieldCheck className="h-4 w-4" />
              Secure Authentication
            </div>

            <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
              Secure.
              <br />

              <span className="text-primary">
                Fast.
              </span>

              <br />
              Future Ready.
            </h1>

            <p className="mt-6 max-w-xl text-muted-foreground">
              A modern authentication platform built
              for secure and scalable applications.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">

              {/* Get Started */}
              <NavLink
                to="/signup"
                className={buttonVariants({
                  variant: "default",
                })}
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </NavLink>

              {/* Login */}
              <NavLink
                to="/login"
                className={buttonVariants({
                  variant: "outline",
                })}
              >
                Login
              </NavLink>

            </div>
          </motion.div>

          {/* Right */}
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              duration: 0.7,
              delay: 0.15,
            }}
            className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1"
          >

            {/* Secure */}
            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <ShieldCheck className="h-7 w-7 text-primary" />

                <div>
                  <h3 className="font-semibold">
                    Secure
                  </h3>

                  <p className="text-sm text-muted-foreground">
                    JWT based authentication
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Protected */}
            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <Lock className="h-7 w-7 text-primary" />

                <div>
                  <h3 className="font-semibold">
                    Protected
                  </h3>

                  <p className="text-sm text-muted-foreground">
                    Secure user sessions
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Fast */}
            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <Zap className="h-7 w-7 text-primary" />

                <div>
                  <h3 className="font-semibold">
                    Fast
                  </h3>

                  <p className="text-sm text-muted-foreground">
                    Modern authentication flow
                  </p>
                </div>
              </CardContent>
            </Card>

          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default FuturisticAuthHome;
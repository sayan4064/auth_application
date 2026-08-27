import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Fingerprint,
  Globe,
  KeyRound,
  Lock,
  Shield,
  Sparkles,
  Clock3,
} from "lucide-react";
import { NavLink } from "react-router";

function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden">
        {/* Background glow */}
        <div className="pointer-events-none absolute left-1/2 top-0 -z-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-foreground/[0.03] blur-3xl" />

        <div className="relative mx-auto flex max-w-6xl flex-col items-center px-6 pb-20 pt-24 text-center lg:pt-28">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-7 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground"
          >
            <Sparkles className="h-4 w-4 text-foreground" />
            <span>Secure auth made simple</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="max-w-5xl text-5xl font-semibold tracking-[-0.04em] text-foreground sm:text-6xl lg:text-7xl"
          >
            Classic authentication
            <br />
            <span className="text-muted-foreground">
              for modern apps
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-7 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg"
          >
            Password, OTP, and social sign-in with token refresh baked in.
            Drop-in UI, clean APIs, and production-grade security.
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-9 flex flex-col items-center gap-4 sm:flex-row"
          >
            {/* Get Started */}
            <NavLink
              to="/signup"
              className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-7 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Get started free
              <ArrowRight className="ml-2 h-4 w-4" />
            </NavLink>

            {/* Login */}
            <NavLink
              to="/login"
              className="inline-flex h-12 items-center justify-center rounded-md border border-border bg-background px-7 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Login
            </NavLink>
          </motion.div>

          {/* Small text */}
          <p className="mt-5 text-sm text-muted-foreground">
            No credit card required · 14-day trial
          </p>
        </div>
      </section>

      {/* ================= FEATURE STRIP ================= */}
      <section className="mx-auto max-w-6xl px-6">
        <div className="grid overflow-hidden rounded-xl border border-border bg-card sm:grid-cols-2 lg:grid-cols-4">
          <FeatureItem
            icon={<Shield className="h-6 w-6" />}
            text="ISO-ready"
          />

          <FeatureItem
            icon={<Globe className="h-6 w-6" />}
            text="OAuth & OIDC"
          />

          <FeatureItem
            icon={<Clock3 className="h-6 w-6" />}
            text="99.99% Uptime"
          />

          <FeatureItem
            icon={<Lock className="h-6 w-6" />}
            text="SSO & MFA"
          />
        </div>
      </section>

      {/* ================= WHY AUTH APP ================= */}
      <section className="mx-auto max-w-6xl px-6 pb-24 pt-24">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Why choose Auth App?
          </h2>

          <p className="mt-4 text-muted-foreground">
            Everything you need to plug authentication into your product.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-5 lg:grid-cols-3">
          <AuthCard
            icon={<Lock className="h-6 w-6" />}
            title="Secure by default"
            description="httpOnly cookies, short-lived JWTs, and sane defaults."
          />

          <AuthCard
            icon={<Fingerprint className="h-6 w-6" />}
            title="MFA & OTP"
            description="Email/SMS OTP, TOTP, and backup codes to keep accounts safe."
          />

          <AuthCard
            icon={<KeyRound className="h-6 w-6" />}
            title="Social sign-in"
            description="Google, GitHub, Apple, and more with one config."
          />
        </div>
      </section>
    </main>
  );
}

/* ================= FEATURE ITEM ================= */

function FeatureItem({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-center gap-4 border-b border-border px-6 py-5 text-muted-foreground last:border-b-0 sm:border-r sm:last:border-r-0 lg:border-b-0">
      <div className="text-foreground">
        {icon}
      </div>

      <span className="text-sm font-medium">
        {text}
      </span>
    </div>
  );
}

/* ================= AUTH CARD ================= */

function AuthCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
<motion.div
      whileHover={{ y: -6 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}
      className="
        rounded-xl
        border
        border-border
        bg-card
        p-7
        shadow-sm
        transition-colors
        duration-300
        hover:border-primary/30
        hover:shadow-lg
      "
    >      {/* Icon */}
      <div className="mb-7 flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-background text-foreground">
        {icon}
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-card-foreground">
        {title}
      </h3>

      {/* Description */}
      <p className="mt-3 min-h-[56px] text-sm leading-6 text-muted-foreground">
        {description}
      </p>

      {/* Bottom */}
      <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
        <Check className="h-4 w-4" />

        <span>
          Easy to integrate
        </span>
      </div>
    </motion.div>
  );
}

export default Home;
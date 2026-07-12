import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function AuthNavBar() {
  return (
    <div className="fixed top-0 inset-x-0 z-50 pt-safe bg-background">
      <div className="flex items-center h-11 px-1">
        <Link
          to="/login"
          className="inline-flex items-center gap-1 h-9 px-2 rounded-lg text-foreground hover:bg-muted transition-colors"
          aria-label="Back to log in"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Log in</span>
        </Link>
      </div>
    </div>
  );
}
import { useState } from "react";
import emailjs from "emailjs-com";
import Shell from "../layout/Shell";
import {
  Stack,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";

import FavoriteIcon from "@mui/icons-material/Favorite";
import HomeIcon from "@mui/icons-material/Home";
import QuizIcon from "@mui/icons-material/Quiz";
import SchoolIcon from "@mui/icons-material/School";
import ContactPageIcon from "@mui/icons-material/ContactPage";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AddCardIcon from "@mui/icons-material/AddCard";
import InfoIcon from "@mui/icons-material/Info";

export default function Contact() {
  const leftItems = [
    { label: "Home", href: "#/", icon: <HomeIcon color="primary" /> },
    { label: "Dashboard", href: "#/dashboard", icon: <DashboardIcon color="primary" /> },
    { label: "Practice", href: "#/practice", icon: <SchoolIcon color="primary" /> },
    { label: "Quiz", href: "#/quiz", icon: <QuizIcon color="secondary" /> },
    { label: "Favorites", href: "#/favorites", icon: <FavoriteIcon color="primary" /> },
    { label: "Submit MCQs", href: "#/submit", icon: <AddCardIcon color="primary" /> },
    { label: "About Us", href: "#/about", icon: <InfoIcon color="primary" /> },
    { label: "Contact Us", href: "#/contact", icon: <ContactPageIcon color="primary" /> },
  ];

  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<null | "success" | "error">(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    emailjs
      .send(
        "service_mexcaq6", // replace with your EmailJS service ID
        "template_ijj2t2y", // replace with your EmailJS template ID
        {
          from_name: form.name,
          from_email: form.email,
          message: form.message,
        },
        "niueBp7VqO1FrYZtf" // replace with your EmailJS public key
      )
      .then(
        () => {
          setStatus("success");
          setForm({ name: "", email: "", message: "" });
          setLoading(false);
        },
        () => {
          setStatus("error");
          setLoading(false);
        }
      );
  };

  return (
    <Shell leftItems={leftItems}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Contact Us
      </Typography>

      <form onSubmit={handleSubmit}>
        <Stack spacing={2} sx={{ maxWidth: 520 }}>
          <TextField
            label="Your Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            fullWidth
          />
          <TextField
            label="Your Email Address"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            fullWidth
          />
          <TextField
            label="Message"
            name="message"
            value={form.message}
            onChange={handleChange}
            multiline
            minRows={3}
            required
            fullWidth
          />
          <Button
            variant="contained"
            type="submit"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? "Sending..." : "Send Message"}
          </Button>

          {status === "success" && (
            <Alert severity="success">✅ Message sent successfully!</Alert>
          )}
          {status === "error" && (
            <Alert severity="error">❌ Failed to send. Please try again.</Alert>
          )}
        </Stack>
      </form>

      {/* Optional WhatsApp Direct Contact */}
      <Typography variant="body1" sx={{ mt: 4 }}>
        Or reach us directly on{" "}
        <a
          href="https://wa.me/923468338480"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#25D366", fontWeight: "bold" }}
        >
          WhatsApp
        </a>
      </Typography>
    </Shell>
  );
}

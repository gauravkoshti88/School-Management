import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Globe,
  Image as ImageIcon,
  Link as LinkIcon,
  Mail,
  MapPin,
  MessageCircle,
  RotateCcw,
  Save,
  Trash2,
  UserRound,
  X,
  Phone,
} from "lucide-react";

import { FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

import {
  createWebsite,
  deleteWebsiteImage,
  getWebsite,
  updateWebsite,
  uploadWebsiteImage,
} from "../../service/website.service";

const emptyImage = {
  publicId: "",
  url: "",
  alt: "",
};

const initialFormData = {
  websiteName: "",
  favicon: { ...emptyImage },
  lightLogo: { ...emptyImage },
  darkLogo: { ...emptyImage },
  mainPoster: { ...emptyImage },

  about: {
    title: "",
    description: "",
    image: { ...emptyImage },
  },

  contact: {
    phone: "",
    email: "",
    address: "",
    mapUrl: "",
    whatsapp: "",
  },

  socialLinks: {
    facebook: "",
    instagram: "",
    youtube: "",
    twitter: "",
  },
};

const sections = [
  {
    key: "general",
    label: "General",
    icon: Globe,
    title: "General Settings",
    description: "Manage your website title and branding.",
  },
  {
    key: "about",
    label: "About",
    icon: UserRound,
    title: "About Settings",
    description: "Manage your school's about information.",
  },
  {
    key: "contact",
    label: "Contact",
    icon: Phone,
    title: "Contact Settings",
    description: "Manage your school's contact information.",
  },
  {
    key: "social",
    label: "Social Media",
    icon: LinkIcon,
    title: "Social Media Settings",
    description: "Manage your school's social media links.",
  },
];

const inputBase =
  "w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:placeholder:text-gray-600 dark:focus:border-indigo-400 dark:focus:ring-indigo-400/10";

const normalizeWebsite = (website) => ({
  websiteName: website?.websiteName || "",

  favicon: {
    publicId: website?.favicon?.publicId || "",
    url: website?.favicon?.url || "",
    alt: website?.favicon?.alt || "",
  },

  lightLogo: {
    publicId: website?.lightLogo?.publicId || "",
    url: website?.lightLogo?.url || "",
    alt: website?.lightLogo?.alt || "",
  },

  darkLogo: {
    publicId: website?.darkLogo?.publicId || "",
    url: website?.darkLogo?.url || "",
    alt: website?.darkLogo?.alt || "",
  },

  mainPoster: {
    publicId: website?.mainPoster?.publicId || "",
    url: website?.mainPoster?.url || "",
    alt: website?.mainPoster?.alt || "",
  },

  about: {
    title: website?.about?.title || "",
    description: website?.about?.description || "",
    image: {
      publicId: website?.about?.image?.publicId || "",
      url: website?.about?.image?.url || "",
      alt: website?.about?.image?.alt || "",
    },
  },

  contact: {
    phone: website?.contact?.phone || "",
    email: website?.contact?.email || "",
    address: website?.contact?.address || "",
    mapUrl: website?.contact?.mapUrl || "",
    whatsapp: website?.contact?.whatsapp || "",
  },

  socialLinks: {
    facebook: website?.socialLinks?.facebook || "",
    instagram: website?.socialLinks?.instagram || "",
    youtube: website?.socialLinks?.youtube || "",
    twitter: website?.socialLinks?.twitter || "",
  },
});

const WebsiteSettings = () => {
  const [formData, setFormData] = useState(initialFormData);

  const [savedSnapshot, setSavedSnapshot] = useState(
    JSON.stringify(initialFormData),
  );

  const [activeSection, setActiveSection] = useState("general");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [websiteExists, setWebsiteExists] = useState(false);

  const currentConfig =
    sections.find((section) => section.key === activeSection) || sections[0];

  const isDirty = useMemo(
    () => JSON.stringify(formData) !== savedSnapshot,
    [formData, savedSnapshot],
  );

  useEffect(() => {
    fetchWebsite();
  }, []);

  useEffect(() => {
    setError("");
    setSuccess("");
  }, [activeSection]);

  useEffect(() => {
    if (!success) {
      return undefined;
    }

    const timer = setTimeout(() => {
      setSuccess("");
    }, 4000);

    return () => clearTimeout(timer);
  }, [success]);

  const fetchWebsite = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getWebsite();

      if (response?.website) {
        const normalized = normalizeWebsite(response.website);

        setFormData(normalized);
        setSavedSnapshot(JSON.stringify(normalized));
        setWebsiteExists(Boolean(response.website._id));
      }
    } catch (err) {
      console.error("Fetch website settings error:", err);

      setError(
        err.response?.data?.message || "Unable to load website settings.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (section, field, value) => {
    if (!section) {
      setFormData((previous) => ({
        ...previous,
        [field]: value,
      }));

      return;
    }

    setFormData((previous) => ({
      ...previous,
      [section]: {
        ...previous[section],
        [field]: value,
      },
    }));
  };

  const handleImageChange = (field, imageField, value) => {
    if (field === "about") {
      setFormData((previous) => ({
        ...previous,
        about: {
          ...previous.about,
          image: {
            ...previous.about.image,
            [imageField]: value,
          },
        },
      }));

      return;
    }

    setFormData((previous) => ({
      ...previous,
      [field]: {
        ...previous[field],
        [imageField]: value,
      },
    }));
  };

  const handleReset = () => {
    setFormData(JSON.parse(savedSnapshot));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = websiteExists
        ? await updateWebsite(formData)
        : await createWebsite(formData);

      let nextData = formData;

      if (response?.website) {
        const website = response.website;

        setWebsiteExists(true);

        nextData = normalizeWebsite(website);

        setFormData(nextData);
      }

      setSavedSnapshot(JSON.stringify(nextData));

      setSuccess(response?.message || "Website settings saved successfully.");
    } catch (err) {
      console.error("Save website settings error:", err);

      setError(
        err.response?.data?.message || "Unable to save website settings.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <div className="pb-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                {currentConfig.title}
              </h1>

              <p className="mt-1.5 text-sm text-gray-500">
                {currentConfig.description}
              </p>
            </div>

            <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30 sm:flex">
              <currentConfig.icon size={22} />
            </div>
          </div>
        </header>

        {error && (
          <Alert type="error" onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert type="success" onClose={() => setSuccess("")}>
            {success}
          </Alert>
        )}

        <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <nav className="flex gap-1 overflow-x-auto rounded-2xl border border-gray-200 bg-white p-1.5 shadow-sm dark:border-gray-800 dark:bg-gray-900 lg:flex-col lg:overflow-visible">
              {sections.map((section) => (
                <SettingTab
                  key={section.key}
                  icon={section.icon}
                  active={activeSection === section.key}
                  onClick={() => setActiveSection(section.key)}
                >
                  {section.label}
                </SettingTab>
              ))}
            </nav>
          </aside>

          <form id="website-settings-form" onSubmit={handleSubmit}>
            {activeSection === "general" && (
              <GeneralSection
                formData={formData}
                handleChange={handleChange}
                handleImageChange={handleImageChange}
              />
            )}

            {activeSection === "about" && (
              <AboutSection
                formData={formData}
                handleChange={handleChange}
                handleImageChange={handleImageChange}
              />
            )}

            {activeSection === "contact" && (
              <ContactSection formData={formData} handleChange={handleChange} />
            )}

            {activeSection === "social" && (
              <SocialSection formData={formData} handleChange={handleChange} />
            )}
          </form>
        </div>
      </div>

      <div className="sticky bottom-4 z-20 mx-auto mt-6 max-w-6xl">
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white px-5 py-3 shadow-lg shadow-gray-900/5 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-2 text-sm">
            <span
              className={`h-2 w-2 rounded-full ${
                isDirty ? "bg-amber-500" : "bg-emerald-500"
              }`}
            />

            <span className="text-gray-600 dark:text-gray-400">
              {isDirty ? "You have unsaved changes" : "All changes saved"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              disabled={!isDirty || saving}
              className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <RotateCcw size={16} />

              <span className="hidden sm:inline">Discard</span>
            </button>

            <button
              type="submit"
              form="website-settings-form"
              disabled={saving || !isDirty}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm shadow-indigo-600/30 transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SettingTab = ({ icon: Icon, active, children, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex min-w-max items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition ${
      active
        ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
    }`}
  >
    <Icon size={17} />

    {children}
  </button>
);

const Card = ({ icon: Icon, title, description, children }) => (
  <section className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <div className="flex items-start gap-3 border-b border-gray-100 px-6 py-5 dark:border-gray-800">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
        <Icon size={19} />
      </div>

      <div>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          {title}
        </h2>

        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </div>
    </div>

    <div className="p-6">{children}</div>
  </section>
);

const Alert = ({ type, children, onClose }) => {
  const isError = type === "error";
  const Icon = isError ? AlertCircle : CheckCircle2;

  return (
    <div
      role="alert"
      className={`mb-6 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
        isError
          ? "border-red-200 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"
          : "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300"
      }`}
    >
      <Icon size={18} className="mt-0.5 shrink-0" />

      <p className="flex-1">{children}</p>

      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss"
        className="rounded p-0.5 opacity-60 transition hover:opacity-100"
      >
        <X size={16} />
      </button>
    </div>
  );
};

const Field = ({
  label,
  hint,
  counter,
  icon: Icon,
  iconClassName,
  children,
}) => (
  <div>
    <div className="mb-1.5 flex items-center justify-between gap-2">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        {Icon && (
          <Icon size={16} className={iconClassName || "text-gray-400"} />
        )}

        {label}
      </label>

      {counter && (
        <span className="text-xs tabular-nums text-gray-400">{counter}</span>
      )}
    </div>

    {children}

    {hint && (
      <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">{hint}</p>
    )}
  </div>
);

const TextInput = ({ value, onChange, ...props }) => (
  <input
    value={value || ""}
    onChange={(event) => onChange(event.target.value)}
    className={inputBase}
    {...props}
  />
);

const PageSkeleton = () => (
  <div className="mx-auto max-w-6xl animate-pulse">
    <div className="mb-8 space-y-3">
      <div className="h-8 w-64 rounded bg-gray-200 dark:bg-gray-800" />
      <div className="h-4 w-80 rounded bg-gray-200 dark:bg-gray-800" />
    </div>

    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <div className="h-48 rounded-2xl bg-gray-200 dark:bg-gray-800" />
      <div className="h-96 rounded-2xl bg-gray-200 dark:bg-gray-800" />
    </div>
  </div>
);

const GeneralSection = ({ formData, handleChange, handleImageChange }) => (
  <div className="space-y-6">
    <Card
      icon={Globe}
      title="General Information"
      description="Configure your school's name and branding."
    >
      <Field
        label="Website Title"
        counter={`${formData.websiteName.length}/100`}
        hint="Shown in the browser tab and search results."
      >
        <TextInput
          type="text"
          value={formData.websiteName}
          onChange={(value) => handleChange(null, "websiteName", value)}
          placeholder="Enter website title"
          maxLength={100}
          required
        />
      </Field>
    </Card>

    <Card
      icon={ImageIcon}
      title="Branding Assets"
      description="Upload your favicon, logos and main website poster."
    >
      <div className="grid gap-6 md:grid-cols-2">
        <ImageUploadField
          title="Favicon"
          description="Square PNG, JPG, WEBP or ICO"
          image={formData.favicon}
          onChange={(field, value) =>
            handleImageChange("favicon", field, value)
          }
        />

        <ImageUploadField
          title="Light Logo"
          description="For light backgrounds"
          image={formData.lightLogo}
          onChange={(field, value) =>
            handleImageChange("lightLogo", field, value)
          }
        />

        <ImageUploadField
          title="Dark Logo"
          description="For dark backgrounds"
          image={formData.darkLogo}
          dark
          onChange={(field, value) =>
            handleImageChange("darkLogo", field, value)
          }
        />

        <ImageUploadField
          title="Main Poster"
          description="Large hero image shown below the navbar"
          image={formData.mainPoster}
          wide
          onChange={(field, value) =>
            handleImageChange("mainPoster", field, value)
          }
        />
      </div>
    </Card>

    <BrandPreview formData={formData} />
  </div>
);

const BrandPreview = ({ formData }) => (
  <Card
    icon={Globe}
    title="Live Preview"
    description="See how your branding will appear on the website."
  >
    <div className="space-y-5">
      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 bg-gray-100 px-3 pt-2 dark:bg-gray-800">
          <div className="flex gap-1.5 pb-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </div>

          <div className="ml-3 flex max-w-[220px] items-center gap-2 rounded-t-lg bg-white px-3 py-1.5 text-xs text-gray-700 dark:bg-gray-900 dark:text-gray-200">
            {formData.favicon.url ? (
              <img
                src={formData.favicon.url}
                alt=""
                className="h-4 w-4 object-contain"
              />
            ) : (
              <Globe size={14} className="text-gray-400" />
            )}

            <span className="truncate">
              {formData.websiteName || "Website title"}
            </span>
          </div>
        </div>
      </div>

      {formData.mainPoster.url && (
        <div>
          <p className="mb-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
            Main Poster
          </p>

          <div className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
            <img
              src={formData.mainPoster.url}
              alt={formData.mainPoster.alt || "Main poster"}
              className="h-52 w-full object-cover sm:h-64"
            />

            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-4 pt-10">
              <p className="text-sm font-semibold text-white">
                {formData.websiteName || "School Website"}
              </p>

              <p className="mt-1 text-xs text-white/80">
                Main hero poster preview
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <LogoPreview
          label="Light header"
          src={formData.lightLogo.url}
          alt={formData.lightLogo.alt}
          name={formData.websiteName}
          className="bg-white text-gray-900"
        />

        <LogoPreview
          label="Dark header"
          src={formData.darkLogo.url}
          alt={formData.darkLogo.alt}
          name={formData.websiteName}
          className="bg-gray-900 text-white"
        />
      </div>
    </div>
  </Card>
);

const LogoPreview = ({ label, src, alt, name, className }) => (
  <div>
    <p className="mb-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
      {label}
    </p>

    <div
      className={`flex h-16 items-center rounded-xl border border-gray-200 px-4 dark:border-gray-700 ${className}`}
    >
      {src ? (
        <img
          src={src}
          alt={alt || "Logo"}
          className="max-h-10 object-contain"
        />
      ) : (
        <span className="truncate text-sm font-semibold">
          {name || "Your logo"}
        </span>
      )}
    </div>
  </div>
);

const AboutSection = ({ formData, handleChange, handleImageChange }) => (
  <div className="space-y-6">
    <Card
      icon={UserRound}
      title="About School"
      description="Add information that describes your school."
    >
      <div className="space-y-5">
        <Field
          label="About Title"
          counter={`${formData.about.title.length}/150`}
        >
          <TextInput
            type="text"
            value={formData.about.title}
            onChange={(value) => handleChange("about", "title", value)}
            placeholder="About Our School"
            maxLength={150}
          />
        </Field>

        <Field
          label="About Description"
          counter={`${formData.about.description.length}/3000`}
          hint="Tell visitors about your school's history, mission and values."
        >
          <textarea
            value={formData.about.description}
            onChange={(event) =>
              handleChange("about", "description", event.target.value)
            }
            placeholder="Write something about your school..."
            rows={8}
            maxLength={3000}
            className={`${inputBase} resize-y leading-6`}
          />
        </Field>
      </div>
    </Card>

    <Card
      icon={ImageIcon}
      title="About Image"
      description="A photo shown next to your about section."
    >
      <div className="max-w-xl">
        <ImageUploadField
          title="Cover Image"
          description="Landscape, 1200×800 recommended"
          image={formData.about.image}
          wide
          onChange={(field, value) => handleImageChange("about", field, value)}
        />
      </div>
    </Card>
  </div>
);

const ContactSection = ({ formData, handleChange }) => (
  <div className="space-y-6">
    <Card
      icon={Phone}
      title="Contact Information"
      description="Manage the contact details displayed on the website."
    >
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Phone" icon={Phone}>
          <TextInput
            type="tel"
            value={formData.contact.phone}
            onChange={(value) => handleChange("contact", "phone", value)}
            placeholder="+91 9876543210"
          />
        </Field>

        <Field label="Email" icon={Mail}>
          <TextInput
            type="email"
            value={formData.contact.email}
            onChange={(value) => handleChange("contact", "email", value)}
            placeholder="info@school.com"
          />
        </Field>

        <Field
          label="WhatsApp"
          icon={MessageCircle}
          iconClassName="text-emerald-500"
        >
          <TextInput
            type="tel"
            value={formData.contact.whatsapp}
            onChange={(value) => handleChange("contact", "whatsapp", value)}
            placeholder="+91 9876543210"
          />
        </Field>

        <Field label="Google Map URL" icon={MapPin}>
          <TextInput
            type="url"
            value={formData.contact.mapUrl}
            onChange={(value) => handleChange("contact", "mapUrl", value)}
            placeholder="https://maps.google.com/..."
          />
        </Field>

        <div className="md:col-span-2">
          <Field
            label="Address"
            icon={MapPin}
            counter={`${formData.contact.address.length}/500`}
          >
            <textarea
              value={formData.contact.address}
              onChange={(event) =>
                handleChange("contact", "address", event.target.value)
              }
              placeholder="Enter complete school address"
              rows={4}
              maxLength={500}
              className={`${inputBase} resize-y leading-6`}
            />
          </Field>
        </div>
      </div>
    </Card>
  </div>
);

const socialFields = [
  {
    key: "facebook",
    label: "Facebook",
    icon: FaFacebook,
    color: "text-[#1877F2]",
    placeholder: "https://facebook.com/yourschool",
  },
  {
    key: "instagram",
    label: "Instagram",
    icon: FaInstagram,
    color: "text-[#E4405F]",
    placeholder: "https://instagram.com/yourschool",
  },
  {
    key: "youtube",
    label: "YouTube",
    icon: FaYoutube,
    color: "text-[#FF0000]",
    placeholder: "https://youtube.com/@yourschool",
  },
  {
    key: "twitter",
    label: "Twitter / X",
    icon: FaXTwitter,
    color: "text-black dark:text-white",
    placeholder: "https://x.com/yourschool",
  },
];

const SocialSection = ({ formData, handleChange }) => (
  <Card
    icon={LinkIcon}
    title="Social Media"
    description="Add your school's social media links."
  >
    <div className="space-y-4">
      {socialFields.map(({ key, label, icon: Icon, color, placeholder }) => (
        <div
          key={key}
          className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4"
        >
          <div className="flex w-36 shrink-0 items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800">
              <Icon size={17} className={color} />
            </span>

            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {label}
            </span>
          </div>

          <div className="flex-1">
            <TextInput
              type="url"
              value={formData.socialLinks[key]}
              onChange={(value) => handleChange("socialLinks", key, value)}
              placeholder={placeholder}
            />
          </div>
        </div>
      ))}
    </div>
  </Card>
);

const ImageUploadField = ({
  title,
  description,
  image,
  onChange,
  dark = false,
  wide = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const hasImage = Boolean(image?.url);

  const getImageType = () => {
    if (title === "Favicon") {
      return "favicon";
    }

    if (title === "Light Logo") {
      return "lightLogo";
    }

    if (title === "Dark Logo") {
      return "darkLogo";
    }

    if (title === "Main Poster") {
      return "mainPoster";
    }

    if (title === "Cover Image") {
      return "about";
    }

    return "";
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    setUploadError("");

    if (!file.type.startsWith("image/")) {
      setUploadError("Please select a valid image file.");

      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image size must be less than 5 MB.");

      return;
    }

    const imageType = getImageType();

    if (!imageType) {
      setUploadError("Invalid image type.");

      return;
    }

    try {
      setUploading(true);

      const response = await uploadWebsiteImage({
        file,
        type: imageType,
        alt: image?.alt || title,
      });

      if (!response?.success || !response?.image) {
        throw new Error(response?.message || "Unable to upload image.");
      }

      onChange("publicId", response.image.publicId || "");

      onChange("url", response.image.url || "");

      onChange("alt", response.image.alt || image?.alt || title);
    } catch (error) {
      console.error("Website image upload error:", error);

      setUploadError(
        error.response?.data?.message ||
          error.message ||
          "Unable to upload image.",
      );
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!image?.publicId) {
      onChange("url", "");
      onChange("alt", "");
      onChange("publicId", "");

      return;
    }

    try {
      setDeleting(true);
      setUploadError("");

      const response = await deleteWebsiteImage(image.publicId);

      if (!response?.success) {
        throw new Error(response?.message || "Unable to delete image.");
      }

      onChange("url", "");
      onChange("alt", "");
      onChange("publicId", "");
    } catch (error) {
      console.error("Website image delete error:", error);

      setUploadError(
        error.response?.data?.message ||
          error.message ||
          "Unable to delete image.",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            {title}
          </p>

          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            {description}
          </p>
        </div>

        {hasImage && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={deleting || uploading}
            aria-label={`Remove ${title}`}
            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-red-950/30"
          >
            {deleting ? (
              <span className="block h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-red-500" />
            ) : (
              <Trash2 size={16} />
            )}
          </button>
        )}
      </div>

      <div
        className={`mb-3 flex items-center justify-center overflow-hidden rounded-lg border border-dashed ${
          wide ? "h-44" : "h-28"
        } ${
          dark
            ? "border-gray-700 bg-gray-900"
            : "border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-950"
        }`}
      >
        {hasImage ? (
          <img
            src={image.url}
            alt={image.alt || title}
            className={`h-full w-full ${
              wide ? "object-cover" : "object-contain p-3"
            }`}
          />
        ) : (
          <div className="flex flex-col items-center gap-1.5 text-gray-400">
            <ImageIcon size={26} />

            <span className="text-xs">No image added</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label
          className={`flex min-h-10 cursor-pointer items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300 dark:hover:bg-gray-800 ${
            uploading || deleting
              ? "pointer-events-none cursor-not-allowed opacity-50"
              : ""
          }`}
        >
          {uploading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600" />
              Uploading...
            </span>
          ) : (
            <span>{hasImage ? "Change Image" : "Choose Image"}</span>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading || deleting}
            className="hidden"
          />
        </label>

        <input
          type="text"
          value={image?.alt || ""}
          onChange={(event) => onChange("alt", event.target.value)}
          placeholder="Alt text (describe the image)"
          maxLength={200}
          disabled={uploading || deleting}
          className={inputBase}
        />

        {hasImage && (
          <p className="truncate text-xs text-emerald-600 dark:text-emerald-400">
            Image uploaded to Cloudinary
          </p>
        )}

        {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}
      </div>
    </div>
  );
};

export default WebsiteSettings;

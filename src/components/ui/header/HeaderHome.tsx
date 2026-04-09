"use client";
import LogoHeaderHome from "@/../public/icons/logo-header-home.svg";
import SearchInput from "@/components/elements/input/SearchInput";
import Select from "@/components/elements/select/Select";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect } from "react";
import { useI18nStore, initI18n, useTranslation } from "@/hooks/useI18nStore";

export default function HeaderHome({ logo }: { logo?: string }) {
  const pathName = usePathname();
  const router = useRouter();

  const lang = useI18nStore((s) => s.lang);
  const setLang = useI18nStore((s) => s.setLang);
  const { t } = useTranslation();

  useEffect(() => {
    initI18n();
  }, []);

  return (
    <div className="header-home">
      {logo ? (
        <Image
          src={logo.startsWith("http") ? logo : `/${logo}`}
          alt="Logo"
          width={40}
          height={40}
          style={{ objectFit: "contain", cursor: "pointer" }}
          onClick={() => router?.push("/home")}
        />
      ) : (
        <LogoHeaderHome
          onClick={() => router?.push("/home")}
          style={{ cursor: "pointer" }}
        />
      )}
      <nav>
        <span
          className={pathName === "/home" ? "active" : ""}
          onClick={() => router?.push("/home")}
        >
          <h1>{t("library") || "КИТОБХОНА"}</h1>
        </span>
        <SearchInput onSearch={() => {}} />
      </nav>
      <div className="header-home__select">
        <Select
          labelStyle={{}}
          inputStyle={{ width: "auto", margin: 0 }}
          // key={"lang_select"}
          id={"lang_select"}
          // title={""}
          value={lang}
          onChange={(e) => setLang(e)}
          options={[
            { label: "Тоҷикӣ", value: "tj" },
            { label: "Русский", value: "ru" },
            { label: "English", value: "en" },
          ]}
          placeholder={""}
        />
      </div>
    </div>
  );
}

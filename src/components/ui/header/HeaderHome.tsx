"use client";
import LogoHeaderHome from "@/../public/icons/logo-header-home.svg";
import SearchInput from "@/components/elements/input/SearchInput";
import Select from "@/components/elements/select/Select";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";

export default function HeaderHome({ logo }: { logo?: string }) {
  const pathName = usePathname();
  const router = useRouter();

  console.log("pathName", pathName);

  return (
    <div className="header-home">
      {logo ? (
        <Image
          src={`/${logo}`}
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
          <h1>КИТОБХОНА</h1>
        </span>
        <SearchInput onSearch={() => {}} />
      </nav>
      <Select
        labelStyle={{ minWidth: "200px", maxWidth: "200px" }}
        inputStyle={{ width: "auto", margin: 0 }}
        // key={"lang_select"}
        id={"lang_select"}
        // title={""}
        value={""}
        onChange={() => {}}
        options={[
          { label: "Тоҷикӣ", value: "tj" },
          { label: "Русский", value: "ru" },
          { label: "English", value: "en" },
        ]}
        placeholder={""}
      />
    </div>
  );
}

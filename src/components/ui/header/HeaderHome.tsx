"use client";
import LogoHeaderHome from "@/../public/icons/logo-header-home.svg";
import SearchInput from "@/components/elements/input/SearchInput";
import Select from "@/components/elements/select/Select";
export default function HeaderHome() {
  return (
    <div className="header-home">
      <LogoHeaderHome />
      <nav>
        <span>
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

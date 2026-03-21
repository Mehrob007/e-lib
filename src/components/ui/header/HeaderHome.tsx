import LogoHeaderHome from "@/../public/icons/logo-header-home.svg";
import SearchInput from "@/components/elements/input/SearchInput";
export default function HeaderHome() {
  return (
    <div className="header-home">
      <LogoHeaderHome />
      <span>
        <h1>КИТОБХОНА</h1>
      </span>
      <SearchInput />
    </div>
  );
}

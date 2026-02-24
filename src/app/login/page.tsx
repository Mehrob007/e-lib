import loginIcon from "@/../public/icons/login-icon.svg";
import Input from "@/components/elements/input/Input";
import Image from "next/image";

export default function Login() {

    

  return (
    <div className="login__page">
      <main>
        <div className="login__content">
          <div>
            <Image src={loginIcon} alt="login-icon" />
          </div>

          <div className="login__form">
            <Input  value="" />
          </div>
        </div>
      </main>
    </div>
  );
}

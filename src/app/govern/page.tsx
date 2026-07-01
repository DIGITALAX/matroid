import { getDictionary } from "../[lang]/dictionaries";
import Wrapper from "../components/Common/modules/Wrapper";
import GovernEntry from "../components/Govern/modules/GovernEntry";

export default async function Govern() {
  const dict = await (getDictionary as (locale: any) => Promise<any>)("en");
  return <Wrapper page={<GovernEntry dict={dict} />} dict={dict} />;
}

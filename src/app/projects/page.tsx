import { getDictionary } from "../[lang]/dictionaries";
import Wrapper from "../components/Common/modules/Wrapper";
import ProjectsEntry from "../components/Govern/modules/ProjectsEntry";

export default async function Projects() {
  const dict = await (getDictionary as (locale: any) => Promise<any>)("en");
  return <Wrapper page={<ProjectsEntry dict={dict} />} dict={dict} />;
}

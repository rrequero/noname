import * as anotations from './noname.anotations';
import Noname from './noname';
export default Noname;
declare const exportValue: typeof anotations & {
    Noname: typeof Noname;
};
export { exportValue };

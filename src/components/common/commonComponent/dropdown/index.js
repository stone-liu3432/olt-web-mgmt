import dropdown from './dropdown';
import dropdownItem from './dropdownItem';

export default {
    install(Vue){
        Vue.component('nmsDropdown', dropdown);
        Vue.component('nmsDropdownItem', dropdownItem);
    }
}
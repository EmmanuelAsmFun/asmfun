import Vue from "../../lib/vue.esm.browser.min.js"
export function myEditableFieldInit(myRootV) {

    Vue.component('editable-field', {
        data: function () {
            return {
                isInEditMode: false,
                newvalue: '',
            }
        },
        props: ['value'],
        methods: {
            ChangeValue: function (evt) {
                if (evt.which === 13) {
                    // ENTER
                    this.isInEditMode = false;
                    var hasChanged = this.value != this.newvalue;
                    if (hasChanged) {
                        this.value = this.newvalue;
                        this.$emit('input', this.newvalue);
                        this.$emit('valuechanged', this.newvalue);
                    }
                }
                else if (evt.which == 27) {
                    // ESC
                    this.isInEditMode = false;
                }
            },
            SwapEditState: function (orivalue) {
                this.isInEditMode = !this.isInEditMode;
                if (this.isInEditMode) {
                    this.newvalue = orivalue;
                   // this.$nextTick(() => this.$refs.myInput.focus());
                }
            },
            updateValue: function (b) {
                this.newvalue = b;
            }
        },
        template:
            `<div class="editableField">
    <input v-if="isInEditMode" type="text" v-bind:value="newvalue" v-on:input="updateValue($event.target.value)" 
        v-on:keyup="ChangeValue(event)" autofocus />
    <span class="ef-view" v-if="!isInEditMode" v-on:click="SwapEditState(value)">{{value}}&nbsp;</span>
    <a v-if="isInEditMode" v-on:click="SwapEditState(value)">X</a>
</div>`
    });


    Vue.component('editable-checkbox', {
        data: function () {
            return {
                newvalue: false,
            }
        },
        props: ['value'],
        methods: {
            SwapState: function (evt) {
                this.value = !this.value;
                this.$emit('input', this.value);
                this.$emit('valuechanged', this.value);
            },
        },
        template:
            `<div class="editableField"><span class="ef-view" v-on:click="SwapState(value)">{{value}}&nbsp;</span></div>`
    });


    Vue.component('editable-select', {
        data: function () {
            return {
                isInEditMode: false,
                isChanging:false,
                newvalue: '',
            }
        },
        props: ['value','options'],
        methods: {
            onChange: function (evt, newv) {
                if (this.isChanging) return;
                this.isChanging = true;
                this.isInEditMode = false;
                this.$emit('input', newv);
                this.$emit('valuechanged', newv);
                this.isChanging = false;
            },
            SwapEditState: function (orivalue) {
                this.isInEditMode = !this.isInEditMode;
                if (this.isInEditMode) {
                    this.newvalue = orivalue;
                    // this.$nextTick(() => this.$refs.myInput.focus());
                } 
            },
            updateValue: function (b) {
                this.newvalue = b;
            }
        },
        template:
            `<div class="editableField">
<select v-model="value" v-if="isInEditMode" autofocus @change="onChange($event,value)" >
    <option v-for="option in options" >{{ option }}</option>
</select>
    <span class="ef-view" v-if="!isInEditMode" v-on:click="SwapEditState(value)">{{value}}&nbsp;</span>
    <a v-if="isInEditMode" v-on:click="SwapEditState(value)">X</a>
</div>`
    });
    //v-on:input="$emit('input',$event.target.value)"
};
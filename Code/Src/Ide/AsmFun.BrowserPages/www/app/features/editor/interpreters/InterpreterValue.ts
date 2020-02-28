import { IPropertyManager } from "../data/IPropertyManager.js";
import { AsmTools } from "../../../Tools.js";

export class InterpreterValue {

    public static GetNumericAddressValue(propertyManager: IPropertyManager, data: string): number {
        // Split on operators
        var regEx = /[/*^+-]/g;
        var lastValueNum = 0;
        var lastIndex = 0;
        var match: RegExpExecArray | null;
        var operator = "";
        var valueOps: { value: string, op: string }[] = [];
        while ((match = regEx.exec(data)) != null) {
            var value = data.substring(lastIndex, match.index).trim();
            valueOps.push({ op: operator, value: value });
            lastIndex = match.index + match.length;
            operator = data.substr(match.index, match.length);
        }
        valueOps.push({ op: operator, value: data.substring(lastIndex).trim() });
        for (var i = 0; i < valueOps.length; i++) {
            var valOp = valueOps[i];
            var newValue = 0;
            var tryVal = AsmTools.ConvertToNumber(valOp.value, true);
            if (!isNaN(tryVal)) {
                newValue = tryVal;
            } else {
                var prop = propertyManager.Find(valOp.value);
                if (prop != null)
                    newValue = prop.AddressNum;
                else
                    newValue = 0;
            }
            switch (valOp.op) {
                case "+": lastValueNum += newValue; break;
                case "-": lastValueNum -= newValue; break;
                case "*": lastValueNum *= newValue; break;
                case "/": lastValueNum /= newValue; break;
                case "^": lastValueNum ^= newValue; break;
                default: lastValueNum = newValue; break;
            }

        };
        return lastValueNum;
    }
    public static GetNumericValue(propertyManager: IPropertyManager, data: string): number {
        // Split on operators
        var regEx = /[/*^+-]/g;
        var lastValueNum = 0;
        var lastIndex = 0;
        var match: RegExpExecArray | null;
        var operator = "";
        var valueOps: { value: string, op: string }[] = [];
        while ((match = regEx.exec(data)) != null) {
            var value = data.substring(lastIndex, match.index).trim();
            valueOps.push({ op: operator, value: value });
            lastIndex = match.index + match.length;
            operator = data.substr(match.index, match.length);
        }
        valueOps.push({ op: operator, value: data.substring(lastIndex).trim() });
        for (var i = 0; i < valueOps.length; i++) {
            var valOp = valueOps[i];
            var newValue = 0;
            var tryVal = AsmTools.ConvertToNumber(valOp.value, true);
            if (!isNaN(tryVal)) {
                newValue = tryVal;
            } else {
                var prop = propertyManager.Find(valOp.value);
                if (prop != null)
                    newValue = prop.ValueNum;
                else
                    newValue = 0;
            }
            switch (valOp.op) {
                case "+": lastValueNum += newValue; break;
                case "-": lastValueNum -= newValue; break;
                case "*": lastValueNum *= newValue; break;
                case "/": lastValueNum /= newValue; break;
                case "^": lastValueNum ^= newValue; break;
                default: lastValueNum = newValue; break;
            }

        };
        return lastValueNum;
    }

}
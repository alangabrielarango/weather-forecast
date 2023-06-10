import * as moment from "moment";

export const getDayName = (time: string): string => {
    if (moment(time).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD')) {
        return 'Today';
    }
    return moment(time).format('ddd');
}
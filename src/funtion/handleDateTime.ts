import firestore from '@react-native-firebase/firestore';
const monthName=[
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
]
export class handleDateTime{
    static DateString=(num:any)=>{
        const date=new Date(num)
        return` ${date.getDate()} ${monthName[date.getMonth()]} ${date.getFullYear()}`
    }
    static DateToString=()=>{
        const date=new Date()
        return` ${date.getDate()} ${monthName[date.getMonth()]} ${date.getFullYear()}`
    }
    static formatDate=()=>{

    }
    static GetHour = (timestamp: any) => {
      // Kiểm tra xem timestamp có phải là đối tượng hợp lệ không
      if (!timestamp || typeof timestamp.seconds !== 'number' || typeof timestamp.nanoseconds !== 'number') {
        console.error('Invalid timestamp:', timestamp);
        return 'Invalid time'; // Hoặc bất kỳ giá trị mặc định nào khác
      }
  
      const startDate: Date = new firestore.Timestamp(timestamp.seconds, timestamp.nanoseconds).toDate();
  
      const options: Intl.DateTimeFormatOptions = { 
        hour: "2-digit", 
        minute: "2-digit", 
        hour12: true 
      };
      const startTime: string = startDate.toLocaleTimeString('en-US', options); 
      return startTime;}
}
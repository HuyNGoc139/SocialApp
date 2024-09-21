import firestore from '@react-native-firebase/firestore';
interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
}
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
      static convertFirestoreTimestamp(timestamp: FirestoreTimestamp): string {
        // Chuyển đổi về milliseconds
        const milliseconds = timestamp.seconds * 1000 + Math.floor(timestamp.nanoseconds / 1000000);
        
        // Tạo đối tượng Date
        const date = new Date(milliseconds);
        
        // Định dạng ngày tháng
        const options: Intl.DateTimeFormatOptions = { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit', 
            hour: '2-digit', 
            minute: '2-digit',  
            hour12: false 
        };
        
        // Trả về chuỗi định dạng
        return date.toLocaleString('vi-VN', options);
    }
}
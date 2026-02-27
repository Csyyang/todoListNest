import { IsNotEmpty, IsNumber } from "class-validator";

export class weatherDto {
    /** 经度 */
    @IsNotEmpty({ message: '经度不能为空' })
    @IsNumber({}, { message: '经度必须是数字类型' })
    longitude: number;

    /** 纬度 */
    @IsNotEmpty({ message: '维度不能为空' })
    @IsNumber({}, { message: '维度必须是数字类型' })
    latitude: number;
}

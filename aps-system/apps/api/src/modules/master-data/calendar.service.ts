import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { CalendarPlan } from '../../../../../packages/database/src/entities/aps.entities';

@Injectable()
export class CalendarService {
  constructor(
    @InjectRepository(CalendarPlan)
    private calendarRepository: Repository<CalendarPlan>,
  ) {}

  async create(dto: any): Promise<CalendarPlan> {
    const existing = await this.calendarRepository.findOne({
      where: { code: dto.code },
    });

    if (existing) {
      throw new ConflictException(`日历编码 ${dto.code} 已存在`);
    }

    const calendar = this.calendarRepository.create(dto);
    return this.calendarRepository.save(calendar);
  }

  async findAll(query: any): Promise<{ list: CalendarPlan[]; total: number }> {
    const where: any = {};

    if (query.code) {
      where.code = query.code;
    }
    if (query.name) {
      where.name = query.name;
    }
    if (query.type) {
      where.type = query.type;
    }

    const page = query.page || 1;
    const pageSize = query.pageSize || 20;

    const [list, total] = await this.calendarRepository.findAndCount({
      where,
      order: { code: 'ASC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return { list, total };
  }

  async findOne(id: string): Promise<CalendarPlan> {
    const calendar = await this.calendarRepository.findOne({
      where: { id },
    });

    if (!calendar) {
      throw new NotFoundException(`日历 ${id} 不存在`);
    }

    return calendar;
  }

  async update(id: string, dto: any): Promise<CalendarPlan> {
    const calendar = await this.findOne(id);
    Object.assign(calendar, dto);
    return this.calendarRepository.save(calendar);
  }

  async remove(id: string): Promise<void> {
    const calendar = await this.findOne(id);
    await this.calendarRepository.remove(calendar);
  }

  async getWorkdays(id: string, startDate: Date, endDate: Date): Promise<Date[]> {
    const calendar = await this.findOne(id);
    const workdays: Date[] = [];
    const workDaysMap = calendar.workDays as Record<string, boolean>;

    const current = new Date(startDate);
    while (current <= endDate) {
      const dayOfWeek = current.getDay().toString();
      if (workDaysMap[dayOfWeek]) {
        const dateStr = current.toISOString().split('T')[0];
        const holidays = (calendar.holidays || []) as string[];
        if (!holidays.includes(dateStr)) {
          workdays.push(new Date(current));
        }
      }
      current.setDate(current.getDate() + 1);
    }

    return workdays;
  }

  async isWorkday(id: string, date: Date): Promise<boolean> {
    const calendar = await this.findOne(id);
    const dayOfWeek = date.getDay().toString();
    const workDaysMap = calendar.workDays as Record<string, boolean>;
    
    if (!workDaysMap[dayOfWeek]) {
      return false;
    }

    const dateStr = date.toISOString().split('T')[0];
    const holidays = (calendar.holidays || []) as string[];
    return !holidays.includes(dateStr);
  }

  async getNextWorkday(id: string, startDate: Date): Promise<Date> {
    let current = new Date(startDate);
    const maxDays = 365;
    let days = 0;

    while (days < maxDays) {
      if (await this.isWorkday(id, current)) {
        return current;
      }
      current.setDate(current.getDate() + 1);
      days++;
    }

    return current;
  }

  async addWorkdays(id: string, startDate: Date, daysToAdd: number): Promise<Date> {
    let current = new Date(startDate);
    let added = 0;

    while (added < daysToAdd) {
      current.setDate(current.getDate() + 1);
      if (await this.isWorkday(id, current)) {
        added++;
      }
    }

    return current;
  }
}

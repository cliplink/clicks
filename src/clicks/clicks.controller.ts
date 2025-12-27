import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, NatsContext, Payload } from '@nestjs/microservices';
import { ClicksService } from './clicks.service';
import { ClickCreatedEvent } from '../_common/types/click-created-event.type';

@Controller()
export class ClicksController {
  constructor(private readonly clicksService: ClicksService) {}

  @EventPattern('click.created')
  async handleUserCreated(@Payload() data: ClickCreatedEvent, @Ctx() context: NatsContext) {
    console.log(`Received click.created event with data:`, data);
    this.clicksService.addClick(data);
  }
}

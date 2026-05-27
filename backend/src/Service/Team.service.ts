import { Injectable, BadRequestException } from '@nestjs/common';
import { user } from '@Database/Table/Admin/user';
import { user_role } from '@Database/Table/Admin/user_role';
import { HashingService } from './Hashing.service';

@Injectable()
export class TeamService {
  constructor(private _HashingService: HashingService) {}

  async getTeamMembers(companyId: string) {
    const members = await user.find({
      where: { company_id: companyId },
      relations: ['user_role'],
    });

    return members.map(m => ({
      id: m.id,
      first_name: m.first_name,
      last_name: m.last_name,
      email: m.email,
      status: m.status,
      created_on: m.created_on,
      role: m.user_role?.name
    }));
  }

  async addTeamMember(companyId: string, data: any) {
    let agentRole = await user_role.findOne({ where: { code: 'AGENT' } });
    if (!agentRole) {
      agentRole = new user_role();
      agentRole.name = 'Agent';
      agentRole.code = 'AGENT';
      agentRole.created_by_id = '0';
      agentRole.created_on = new Date();
      await agentRole.save();
    }

    const existingUser = await user.findOne({ where: { email: data.email } });
    if (existingUser) {
      throw new BadRequestException("User already exists with this email");
    }

    const newUser = new user();
    newUser.first_name = data.first_name;
    newUser.last_name = data.last_name || '';
    newUser.email = data.email;
    newUser.password = await this._HashingService.Hash(data.password);
    newUser.user_role_id = agentRole.id;
    newUser.company_id = companyId;
    newUser.created_by_id = '0';
    newUser.created_on = new Date();
    await newUser.save();

    return { id: newUser.id, email: newUser.email };
  }

  async removeTeamMember(companyId: string, memberId: string) {
    const member = await user.findOne({ where: { id: memberId, company_id: companyId } });
    if (!member) {
      throw new BadRequestException("Team member not found or access denied");
    }
    
    await user.remove(member);
    return { success: true };
  }
}

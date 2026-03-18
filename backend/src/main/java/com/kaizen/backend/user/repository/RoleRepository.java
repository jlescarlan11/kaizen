package com.kaizen.backend.user.repository;

import java.util.Optional;

import com.kaizen.backend.common.repository.BaseRepository;
import com.kaizen.backend.user.entity.Role;

public interface RoleRepository extends BaseRepository<Role, Long> {

    Optional<Role> findByName(String name);
}

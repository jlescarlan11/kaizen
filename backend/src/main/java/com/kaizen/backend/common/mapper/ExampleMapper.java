package com.kaizen.backend.common.mapper;

import com.kaizen.backend.common.mapper.dto.ExampleSource;
import com.kaizen.backend.common.mapper.dto.ExampleTarget;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ExampleMapper {

    ExampleTarget toTarget(ExampleSource source);
}

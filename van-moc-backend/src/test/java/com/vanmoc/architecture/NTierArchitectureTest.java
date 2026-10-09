package com.vanmoc.architecture;

import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchRule;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

@AnalyzeClasses(packages = "com.vanmoc", importOptions = ImportOption.DoNotIncludeTests.class)
class NTierArchitectureTest {
    @ArchTest
    static final ArchRule controllersUseServices = noClasses().that().resideInAPackage("..controller..")
            .should().dependOnClassesThat().resideInAnyPackage("..repository..", "..entity..", "org.springframework.jdbc..");
    @ArchTest
    static final ArchRule servicesDoNotKnowControllers = noClasses().that().resideInAPackage("..service..")
            .should().dependOnClassesThat().resideInAPackage("..controller..");
    @ArchTest
    static final ArchRule repositoriesDoNotKnowWeb = noClasses().that().resideInAPackage("..repository..")
            .should().dependOnClassesThat().resideInAnyPackage("..controller..", "..service..", "org.springframework.web..");
    @ArchTest
    static final ArchRule dtosDoNotExposeEntities = noClasses().that().resideInAPackage("..dto..")
            .should().dependOnClassesThat().resideInAnyPackage("..entity..", "..repository..");
}

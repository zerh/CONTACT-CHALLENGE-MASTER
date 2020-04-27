import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import * as moment from 'moment';
import { JhiAlertService } from 'ng-jhipster';
import { IPerson, PersonDocumentType } from 'app/shared/model/person.model';
import { PersonService } from './person.service';
import { IUser, UserService } from 'app/core';
import { AnyARecord } from 'dns';

@Component({
    selector: 'jhi-person-update',
    templateUrl: './person-update.component.html'
})
export class PersonUpdateComponent implements OnInit {
    person: IPerson;
    isSaving: boolean;

    users: IUser[];
    birthdayDp: any;

    constructor(
        private router: Router,
        protected jhiAlertService: JhiAlertService,
        protected personService: PersonService,
        protected userService: UserService,
        protected activatedRoute: ActivatedRoute
    ) {}

    ngOnInit() {
        this.isSaving = false;
        localStorage.removeItem('fromPersonUpdate');

        this.activatedRoute.data.subscribe(({ person }) => {
            this.person = person;
            if (localStorage.getItem('editing') == null) {
                localStorage.removeItem('newPerson');
            }
            if (localStorage.getItem('newPerson') !== null) {
                this.person = { ...this.person, ...JSON.parse(localStorage.getItem('newPerson')), id: this.person.id ? this.person.id : null, birthday: moment(this.birthdayDp)};
            }
            if (localStorage.getItem('birthday') !== null) {
                this.birthdayDp = localStorage.getItem('birthday');
            }
            if (localStorage.getItem('newAddress') !== null) {
                if (!this.person.addresses || !(this.person.addresses instanceof Array)) {
                    this.person.addresses = [];
                }
                this.person.addresses.push(JSON.parse(localStorage.getItem('newAddress')));
                localStorage.removeItem('newAddress');
            }
            if (localStorage.getItem('newPersonContact') !== null) {
                if (!this.person.personContacts || !(this.person.personContacts instanceof Array)) {
                    this.person.personContacts = [];
                }
                this.person.personContacts.push(JSON.parse(localStorage.getItem('newPersonContact')));
                localStorage.removeItem('newPersonContact');
            }
        });
        this.userService
            .query()
            .pipe(
                filter((mayBeOk: HttpResponse<IUser[]>) => mayBeOk.ok),
                map((response: HttpResponse<IUser[]>) => response.body)
            )
            .subscribe((res: IUser[]) => {
                return (this.users = res);
            }, (res: HttpErrorResponse) => this.onError(res.message));
    }

    previousState() {
        window.history.back();
    }

    public deleteUnpersistedAddress(unpersisted): void {
        this.person.addresses.forEach( (el, index) => {
            if (JSON.stringify(unpersisted) === JSON.stringify(el)) {
                this.person.addresses.splice(index, 1);
            }
        });
    }

    public deleteUnpersistedPersonContact(unpersisted): void {
        this.person.personContacts.forEach( (el, index) => {
            if (JSON.stringify(unpersisted) === JSON.stringify(el)) {
                this.person.personContacts.splice(index, 1);
            }
        });
    }

    public clearStorage(): void {
        localStorage.removeItem('birthday');
        localStorage.removeItem('newAddress');
        localStorage.removeItem('newPersonContact');
        localStorage.removeItem('editing');
    }

    public saveScreen(): void {
        localStorage.setItem('newPerson', JSON.stringify(this.person));
        localStorage.setItem('birthday', this.birthdayDp);
        localStorage.setItem('fromPersonUpdate', 'true');
    }

    public address(): void {
        this.saveScreen();
        this.router.navigate(['/address', 'new']);
    }

    public personContact(): void {
        this.saveScreen();
        this.router.navigate(['/person-contact', 'new']);
    }

    protected subscribeToSaveResponse(result: Observable<HttpResponse<IPerson>>) {
        result.subscribe((res: HttpResponse<IPerson>) => this.onSaveSuccess(null), (res: HttpErrorResponse) => this.onSaveError());
    }

    public onBirthdayChange(value): void {
        console.log(value);
        this.birthdayDp = value;
        this.person.birthday = moment(value);
    }

    public save(): void {
        this.isSaving = true;
        if (this.person.id !== null) {
            this.personService.update(this.person).subscribe(response => this.onSaveSuccess(response), () => this.onSaveError());
        } else {
            this.personService.create(this.person).subscribe(response => this.onSaveSuccess(response), () => this.onSaveError());
        }
        this.clearStorage();
    }

    protected onSaveSuccess(response) {
        this.isSaving = false;
        this.previousState();
    }

    protected onSaveError() {
        this.isSaving = false;
    }

    protected onError(errorMessage: string) {
        this.jhiAlertService.error(errorMessage, null, null);
    }

    trackUserById(index: number, item: IUser) {
        return item.id;
    }
}
